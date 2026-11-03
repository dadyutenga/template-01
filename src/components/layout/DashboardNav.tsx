import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, LogOut, Settings, User, Search, FileText, Users, Moon, Sun, Globe, Share2, Trash2, Languages, Loader2, BookOpen, Calculator, Bell, Menu, MoreVertical, Clock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/lib/translations";
import searchService, { SearchResults, SearchSuggestion } from "@/services/searchService";
import { toast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";
import { resolveMediaUrl } from "@/lib/media";
import notificationService from "@/services/notificationService";
import { ToastAction } from "@/components/ui/toast";

interface DashboardNavProps {
  userRole: "student" | "lecturer";
  userName: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  hideGlobalSearch?: boolean;
}

const DashboardNav = ({ userRole, userName, onSearch, searchValue, searchPlaceholder, hideGlobalSearch = false }: DashboardNavProps) => {
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ users: [], files: [], classes: [], friends: [], library: [] });
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const lastUnreadRef = useRef(0);

  const searchQuery = searchValue !== undefined ? searchValue : internalSearchQuery;
  const setSearchQuery = onSearch ? onSearch : setInternalSearchQuery;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Navigate anyway to clear local state
      navigate("/");
    }
  };

  // Debounced global search — always active unless hideGlobalSearch is set
  useEffect(() => {
    if (hideGlobalSearch) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults({ users: [], files: [], classes: [], friends: [], library: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchService.search({ q: searchQuery.trim(), limit: 8 });
        setSearchResults(results);
      } catch (error: any) {
        setSearchResults({ users: [], files: [], classes: [], friends: [], library: [] });
        if (searchQuery.trim().length >= 2) {
          toast({
            title: language === 'en' ? 'Search failed' : 'Utafutaji umeshindwa',
            description: error.response?.data?.message || error.message,
            variant: "destructive",
          });
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, hideGlobalSearch, language]);

  // Autocomplete suggestions — triggers at 1 char, debounced 250 ms, no history written
  useEffect(() => {
    if (hideGlobalSearch) return;
    if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);

    if (searchQuery.trim().length < 1) { setSuggestions([]); return; }
    // At 2+ chars we already have full results — skip suggestions to avoid UI conflict
    if (searchQuery.trim().length >= 2) { setSuggestions([]); return; }

    suggestTimeoutRef.current = setTimeout(async () => {
      const results = await searchService.getSuggestions(searchQuery.trim());
      setSuggestions(results);
    }, 250);

    return () => { if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current); };
  }, [searchQuery, hideGlobalSearch]);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarSrc = resolveMediaUrl(user?.profile_image_url ?? null) ?? "/placeholder.svg";

  // Poll unread notifications count for the bell badge + "new notifications" toast.
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      lastUnreadRef.current = 0;
      return;
    }

    let mounted = true;

    const poll = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (!mounted) return;
        setUnreadNotifications(count);
        if (count > lastUnreadRef.current) {
          toast({
            title: "New notifications",
            description: `You have ${count} unread notification${count === 1 ? "" : "s"}.`,
            action: (
              <ToastAction altText="View notifications" onClick={() => navigate("/notifications")}>
                View
              </ToastAction>
            ),
          });
        }
        lastUnreadRef.current = count;
      } catch {
        // silent for polling
      }
    };

    const interval = setInterval(poll, 20000); // 20s
    const onFocus = () => void poll();
    window.addEventListener("focus", onFocus);

    void poll();

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [navigate, user]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-[12px]">
        <div className="container flex h-[64px] items-center justify-between gap-2 md:gap-4 px-2 md:px-4">
          <div className="flex-none">
            <Sidebar>
            <button className="flex items-center gap-3 rounded-[10px] p-[6px_8px] hover:bg-muted transition-colors bg-transparent border-none cursor-pointer">
              <Menu className="h-6 w-6 text-foreground" />
              <div className="hidden sm:block text-left leading-none">
                <span className="block text-[20px] font-bold text-foreground" style={{ fontFamily: "var(--font-display, inherit)" }}>Kibegi</span>
                <small className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                  {userRole}
                </small>
              </div>
            </button>
          </Sidebar>
          </div>

          <div className="flex-1 flex justify-center px-1 md:px-2">
            <div className="relative w-full max-w-[420px]" ref={searchContainerRef}>
              <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground z-10 pointer-events-none" />
              <input
                placeholder={searchPlaceholder || (language === 'en' ? "Search..." : "Tafuta...")}
                className="w-full h-[40px] md:h-[44px] rounded-full border border-border bg-muted/40 pl-[42px] pr-9 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!hideGlobalSearch) setSearchOpen(true);
                }}
                onFocus={() => {
                  if (!hideGlobalSearch) {
                    setSearchOpen(true);
                    if (searchHistory.length === 0) {
                      searchService.getHistory().then(setSearchHistory).catch(() => {});
                    }
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Autocomplete suggestions — 1 char, fast prefix match */}
              {searchOpen && !hideGlobalSearch && searchQuery.trim().length === 1 && suggestions.length > 0 && (
                <div className="absolute top-[115%] left-[-20px] right-[-20px] md:left-0 md:right-0 bg-background border border-border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
                    {language === 'en' ? 'Suggestions' : 'Mapendekezo'}
                  </p>
                  <div className="p-2">
                    {suggestions.map((s, i) => {
                      const icon = s.type === 'user'
                        ? <Users className="h-4 w-4 text-primary" />
                        : s.type === 'class'
                          ? <GraduationCap className="h-4 w-4 text-emerald-500" />
                          : <BookOpen className="h-4 w-4 text-amber-500" />;
                      const iconBg = s.type === 'user' ? 'bg-primary/10' : s.type === 'class' ? 'bg-emerald-500/10' : 'bg-amber-500/10';
                      return (
                        <ResultRow
                          key={i}
                          icon={icon}
                          iconBg={iconBg}
                          primary={s.label}
                          secondary={s.sub}
                          onClick={() => {
                            setSearchQuery(s.label);
                            setSearchOpen(true);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full search results — 2+ chars */}
              {searchOpen && !hideGlobalSearch && searchQuery.trim().length >= 2 && (
                <div className="absolute top-[115%] left-[-20px] right-[-20px] md:left-0 md:right-0 bg-background border border-border rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                  {onSearch && (
                    <div className="px-4 pt-3 pb-1 border-b border-border/60">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {language === 'en' ? 'App-wide results' : 'Matokeo yote ya programu'}
                      </p>
                    </div>
                  )}

                  {isSearching ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'en' ? 'Searching…' : 'Inatafuta…'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {/* Files */}
                      {searchResults.files && searchResults.files.length > 0 && (
                        <ResultSection label={language === 'en' ? 'Files' : 'Faili'}>
                          {searchResults.files.map((file) => (
                            <ResultRow
                              key={file.id}
                              icon={<FileText className="h-4 w-4 text-primary" />}
                              iconBg="bg-primary/10"
                              primary={file.file_name}
                              secondary={[file.file_type?.toUpperCase(), file.uploaded_by_name].filter(Boolean).join(' · ')}
                              onClick={() => { navigate("/files"); setSearchOpen(false); setSearchQuery(""); }}
                            />
                          ))}
                        </ResultSection>
                      )}

                      {/* Classes */}
                      {searchResults.classes && searchResults.classes.length > 0 && (
                        <ResultSection label={language === 'en' ? 'Classes' : 'Madarasa'}>
                          {searchResults.classes.map((cls) => (
                            <ResultRow
                              key={cls.id}
                              icon={<GraduationCap className="h-4 w-4 text-emerald-500" />}
                              iconBg="bg-emerald-500/10"
                              primary={cls.name}
                              secondary={[cls.class_code, cls.creator_name].filter(Boolean).join(' · ')}
                              onClick={() => { navigate(`/classes/${cls.id}`); setSearchOpen(false); setSearchQuery(""); }}
                            />
                          ))}
                        </ResultSection>
                      )}

                      {/* Library */}
                      {searchResults.library && searchResults.library.length > 0 && (
                        <ResultSection label={language === 'en' ? 'Library' : 'Maktaba'}>
                          {searchResults.library.map((item) => (
                            <ResultRow
                              key={item.item_code}
                              icon={<BookOpen className="h-4 w-4 text-amber-500" />}
                              iconBg="bg-amber-500/10"
                              primary={item.title}
                              secondary={[item.category_name, item.subject, item.download_count != null ? `${item.download_count} downloads` : undefined].filter(Boolean).join(' · ')}
                              onClick={() => { navigate("/library"); setSearchOpen(false); setSearchQuery(""); }}
                            />
                          ))}
                        </ResultSection>
                      )}

                      {/* People (users + friends) */}
                      {(searchResults.users?.length || searchResults.friends?.length) ? (
                        <ResultSection label={language === 'en' ? 'People' : 'Watu'}>
                          {[...(searchResults.users ?? []), ...(searchResults.friends ?? [])].map((u) => (
                            <button
                              key={u.id}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
                              onClick={() => { navigate("/friends"); setSearchOpen(false); setSearchQuery(""); }}
                            >
                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                <AvatarImage src={resolveMediaUrl(u.profile_image_url ?? null) || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {(u.full_name || u.email).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden flex-1">
                                <div className="text-sm font-medium truncate">{u.full_name || u.email}</div>
                                <div className="text-[11px] text-muted-foreground truncate capitalize">{u.user_type}</div>
                              </div>
                            </button>
                          ))}
                        </ResultSection>
                      ) : null}

                      {/* Empty state */}
                      {!searchResults.files?.length && !searchResults.classes?.length && !searchResults.users?.length && !searchResults.friends?.length && !searchResults.library?.length && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          {language === 'en' ? 'No results found' : 'Hakuna matokeo yaliyopatikana'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* History dropdown — shown when focused with empty query */}
              {searchOpen && !hideGlobalSearch && searchQuery.trim().length === 0 && searchHistory.length > 0 && (
                <div className="absolute top-[115%] left-[-20px] right-[-20px] md:left-0 md:right-0 bg-background border border-border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {language === 'en' ? 'Recent' : 'Ya hivi karibuni'}
                    </p>
                    <button
                      onClick={() => { searchService.clearHistory().catch(() => {}); setSearchHistory([]); }}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {language === 'en' ? 'Clear' : 'Futa'}
                    </button>
                  </div>
                  <div className="p-2">
                    {searchHistory.slice(0, 6).map((q, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
                        onClick={() => { setSearchQuery(q); setSearchOpen(true); }}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-none flex items-center gap-0.5 md:gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
                  title={language === 'en' ? "More options" : "Chaguo zaidi"}
                >
                  <MoreVertical className="h-[22px] w-[22px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2">
                  <User className="h-4 w-4" />
                  <span>{language === 'en' ? "Profile" : "Wasifu"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-2">
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{theme === 'light' ? t('darkMode') : t('lightMode')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>{language === 'en' ? "Logout" : "Ondoka"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
              onClick={() => navigate("/notifications")}
              title="Notifications"
            >
              <Bell className="h-[22px] w-[22px]" />
              {unreadNotifications > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {language === 'en' ? 'Choose Language' : 'Chagua Lugha'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => {
                setLanguage('en');
                setLanguageDialogOpen(false);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:bg-muted ${language === 'en' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇬🇧</div>
                <div className="text-left">
                  <p className="font-semibold">English</p>
                  <p className="text-sm text-muted-foreground">English</p>
                </div>
              </div>
              {language === 'en' && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setLanguage('sw');
                setLanguageDialogOpen(false);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:bg-muted ${language === 'sw' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇹🇿</div>
                <div className="text-left">
                  <p className="font-semibold">Swahili</p>
                  <p className="text-sm text-muted-foreground">Kiswahili</p>
                </div>
              </div>
              {language === 'sw' && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Search result helper components ──────────────────────────────────────────

const ResultSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 pt-2 pb-1">{label}</p>
    {children}
  </div>
);

const ResultRow = ({
  icon, iconBg, primary, secondary, onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  primary: string;
  secondary?: string;
  onClick: () => void;
}) => (
  <button
    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
    onClick={onClick}
  >
    <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
    <div className="overflow-hidden flex-1">
      <div className="text-sm font-medium truncate">{primary}</div>
      {secondary && <div className="text-[11px] text-muted-foreground truncate">{secondary}</div>}
    </div>
  </button>
);

export default DashboardNav;
