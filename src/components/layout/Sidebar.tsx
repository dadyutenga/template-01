import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Settings,
    Share2,
    Trash2,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Info,
    BookOpen,
    Mail,
    Globe,
    Sun,
    Moon,
    Users,
    Home,
    FolderOpen,
    Radio,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/lib/media";

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
        }
    };

    const menuItems = [
        { label: t('home'), icon: Home, path: "/dashboard" },
        { label: t('files'), icon: FolderOpen, path: "/files" },
        { label: t('library'), icon: FolderOpen, path: "/library" },
        { label: "Vilivyopotea na Kupatikana", icon: Globe, path: "https://www.vilivyopoteanakupatikana.com/", external: true },
        { label: t('friends'), icon: Users, path: "/friends" },
        { label: 'Channel', icon: Radio, path: "/channel" },
        { label: t('sharing'), icon: Share2, path: "/sharing" },
        { label: t('trash'), icon: Trash2, path: "/trash" },
        { label: t('settings'), icon: Settings, path: "/settings" },
    ];

    const infoLinks = [
        { label: 'About', path: "/about", icon: Info },
        { label: 'How to Use', path: "/how-to-use", icon: BookOpen },
        { label: 'Privacy', path: "/privacy", icon: ShieldCheck },
        { label: 'Contact Us', path: "/contact", icon: Mail },
    ];

    return (
                <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[320px] p-0 flex flex-col border-r-0">
                <SheetHeader className="p-5 border-b border-border/60 text-left bg-muted/20">
                    <div className="flex items-center gap-3.5">
                        {user ? (
                            <Avatar className="h-[46px] w-[46px] rounded-[18px] border border-border/70 shadow-sm bg-primary/10 text-primary">
                                <AvatarImage src={resolveMediaUrl(user.profile_image_url ?? null) ?? "/placeholder.svg"} alt={user.full_name || user.email} className="rounded-[18px] object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-base font-bold rounded-[18px]">
                                    {(user.full_name || user.email).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[18px] bg-primary/10 text-primary shadow-sm">
                                <img src="/favicon/favicon.svg" alt="Kibegi Logo" className="h-6 w-6" />
                            </div>
                        )}
                        <div>
                            <SheetTitle className="text-[22px] font-bold leading-tight tracking-tight text-foreground" style={{ fontFamily: "var(--font-display, inherit)" }}>Kibegi</SheetTitle>
                            {user && (
                                <p className="text-[13px] text-muted-foreground truncate max-w-[180px]">
                                    {user.full_name || user.email}
                                </p>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-3 py-4">
                        <h3 className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            Menu
                        </h3>
                        <div className="space-y-0.5">
                            {menuItems.map((item) => (
                                item.external ? (
                                    <a
                                        key={item.label}
                                        href={item.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/80 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <item.icon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-[15px] font-semibold text-foreground/90">{item.label}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ) : (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/80 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <item.icon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-[15px] font-semibold text-foreground/90">{item.label}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>



                    <div className="px-3 py-4">
                        <h3 className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            Information
                        </h3>
                        <div className="space-y-0.5">
                            {infoLinks.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-muted/80 transition-colors group"
                                >
                                    <item.icon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-[15px] font-semibold text-foreground/90">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mx-4 h-px bg-border/60"></div>
                <div className="p-4">
                    <Button
                        variant="ghost"
                        className="w-full h-11 justify-start rounded-2xl text-[15px] font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3.5 h-[18px] w-[18px]" />
                        {t('logout')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default Sidebar;
