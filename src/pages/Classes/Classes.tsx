import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import classService, { ClassData } from "@/services/classService";
import { QRCodeSVG } from "qrcode.react";
import QrScanner from "@/components/QrScanner";
import {
  BadgeCheck,
  BookOpen,
  Camera,
  FolderOpen,
  ChevronRight,
  Globe,
  GraduationCap,
  Hash,
  Keyboard,
  Loader2,
  Lock,
  Plus,
  QrCode,
  Search,
  Users,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type TabKey = "my-classes" | "explore";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } } };

/* ─────────────────────────── Main page ─────────────────────────── */

const Classes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  // ── State (all identical to original) ──
  const [activeTab, setActiveTab] = useState<TabKey>("my-classes");
  const [myClasses, setMyClasses] = useState<ClassData[]>([]);
  const [searchResults, setSearchResults] = useState<ClassData[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinScanMode, setJoinScanMode] = useState<"code" | "camera">("code");
  const [createForm, setCreateForm] = useState({ name: "", description: "", is_public: false });
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", is_public: false });

  // ── Effects (identical to original) ──
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    void fetchMyClasses();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab !== "explore") return;
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); setIsSearching(false); return; }
    const id = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await classService.searchClasses(q);
        setSearchResults(normalizeClassList(res));
      } catch (err: any) {
        toast({
          title: language === "en" ? "Search failed" : "Utafutaji umeshindwa",
          description: err.response?.data?.message || err.message,
          variant: "destructive",
        });
      } finally { setIsSearching(false); }
    }, 400);
    return () => window.clearTimeout(id);
  }, [activeTab, searchQuery, language]);

  // ── Derived (identical to original) ──
  const joinedClassIds = useMemo(() => new Set(myClasses.map((c) => c.id)), [myClasses]);

  const stats = useMemo(() => {
    const verified = myClasses.filter((c) => c.is_verified).length;
    const pub = myClasses.filter((c) => c.is_public).length;
    const members = myClasses.reduce((s, c) => s + (c.member_count || 0), 0);
    return [
      { label: language === "en" ? "Joined" : "Uliojiunga", value: myClasses.length, icon: BookOpen },
      { label: language === "en" ? "Verified" : "Yaliyothibitishwa", value: verified, icon: GraduationCap },
      { label: language === "en" ? "Public" : "Ya umma", value: pub, icon: Globe },
      { label: language === "en" ? "Members" : "Wanachama", value: members, icon: Users },
    ];
  }, [language, myClasses]);

  const filteredMyClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return myClasses;
    return myClasses.filter(c =>
      c.name.toLowerCase().includes(q) || c.class_code.toLowerCase().includes(q)
    );
  }, [myClasses, searchQuery]);

  // ── Handlers (identical to original) ──
  const fetchMyClasses = async () => {
    setIsLoadingClasses(true);
    try {
      setMyClasses(normalizeClassList(await classService.listClasses()));
    } catch (err: any) {
      toast({ title: language === "en" ? "Failed to load classes" : "Imeshindwa kupakia madarasa", description: err.response?.data?.message || err.message, variant: "destructive" });
      setMyClasses([]);
    } finally { setIsLoadingClasses(false); }
  };

  const handleCreateClass = async () => {
    if (!createForm.name.trim()) {
      toast({ title: language === "en" ? "Class name required" : "Jina la darasa linahitajika", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const res = await classService.createClass({ name: createForm.name.trim(), description: createForm.description.trim() || undefined, is_public: createForm.is_public });
      const created = normalizeClassPayload(res);
      toast({ title: language === "en" ? "Class created" : "Darasa limeundwa", description: `${language === "en" ? "Class code" : "Msimbo"}: ${created.class_code}` });
      setIsCreateDialogOpen(false);
      setCreateForm({ name: "", description: "", is_public: false });
      await fetchMyClasses();
      navigate(`/classes/${created.id}`);
    } catch (err: any) {
      toast({ title: language === "en" ? "Create class failed" : "Kuunda darasa kumeshindwa", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally { setIsCreating(false); }
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this class? This action cannot be undone." : "Je, una uhakika unataka kufuta darasa hili? Kitendo hiki hakiwezi kutenduliwa.")) {
      try {
        await classService.deleteClass(classId);
        toast({
          title: language === "en" ? "Success" : "Imefanikiwa",
          description: language === "en" ? "Class deleted successfully" : "Darasa limefutwa kikamilifu",
        });
        setMyClasses(prev => prev.filter(c => c.id !== classId));
        setSearchResults(prev => prev.filter(c => c.id !== classId));
      } catch (err: any) {
        toast({
          title: language === "en" ? "Error" : "Hitilafu",
          description: err.response?.data?.error || (language === "en" ? "Failed to delete class" : "Imeshindwa kufuta darasa"),
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (cls: ClassData) => {
    setEditingClass(cls);
    setEditForm({ name: cls.name, description: cls.description || "", is_public: cls.is_public || false });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingClass) return;
    if (!editForm.name.trim()) {
      toast({ title: language === "en" ? "Class name required" : "Jina la darasa linahitajika", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      await classService.updateClass(editingClass.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        is_public: editForm.is_public
      });
      toast({ title: language === "en" ? "Class updated" : "Darasa limesasishwa", description: language === "en" ? "Class updated successfully" : "Darasa limesasishwa kikamilifu" });
      setIsEditDialogOpen(false);
      await fetchMyClasses();
      if (activeTab === "explore") {
        const res = await classService.searchClasses(searchQuery.trim());
        setSearchResults(normalizeClassList(res));
      }
    } catch (err: any) {
      toast({ title: language === "en" ? "Update failed" : "Kusasisha kumeshindwa", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally { setIsUpdating(false); }
  };

  const joinClassByCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) { toast({ title: language === "en" ? "Class code required" : "Msimbo wa darasa unahitajika", variant: "destructive" }); return; }
    setIsJoining(true);
    try {
      const res = await classService.joinClass({ class_code: code });
      const joined = normalizeClassPayload(res);
      toast({ title: language === "en" ? "Joined class" : "Umejiunga na darasa", description: language === "en" ? `You joined ${joined.name}.` : `Umejiunga na ${joined.name}.` });
      setJoinCode(""); setIsJoinDialogOpen(false);
      await fetchMyClasses();
      navigate(`/classes/${joined.id}`);
    } catch (err: any) {
      toast({ title: language === "en" ? "Join failed" : "Kujiunga kumeshindwa", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally { setIsJoining(false); }
  };

  const handleJoinClass = () => joinClassByCode(joinCode);

  const en = language === "en";
  const userRole = (user?.user_type as "student" | "lecturer") || "student";
  const userName = user?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={userRole}
        userName={userName}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder={en ? "Search classes…" : "Tafuta madarasa…"}
      />

      <main className="container max-w-4xl px-4 py-6 md:py-8">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

          {/* ── Compact header ── */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                {en ? "My Classes" : "Madarasa Yangu"}
              </h1>
              <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                {en
                  ? "Manage the classes you've joined, discover new ones, and jump back in quickly."
                  : "Simamia madarasa uliyojiunga nayo, gundua mapya, na uingie tena kwa haraka."}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <Button id="join-by-code-btn" onClick={() => setIsJoinDialogOpen(true)} variant="hero" size="sm" className="rounded-2xl shadow-sm shadow-primary/20">
                <Hash className="mr-1.5 h-3.5 w-3.5" />
                {en ? "Join by code" : "Jiunge kwa msimbo"}
              </Button>
              <Button id="create-class-btn" variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)} className="rounded-2xl border-border bg-card/80">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {en ? "Create class" : "Unda darasa"}
              </Button>
            </div>
          </motion.div>

          {/* ── Compact stats ── */}
          <motion.div variants={fadeUp}>
            <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {stats.map((s) => (
                <div key={s.label} className="flex min-w-[118px] flex-shrink-0 items-center gap-3 rounded-2xl border border-border/70 bg-card/85 px-4 py-3 shadow-sm backdrop-blur-sm md:min-w-0">
                  <div className="rounded-xl bg-primary/10 p-1.5 text-primary flex-shrink-0">
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
                    <p className="text-base font-bold leading-tight text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Segmented tabs ── */}
          <motion.div variants={fadeUp}>
            <div className="grid w-full grid-cols-2 rounded-2xl bg-muted/80 p-1">
              {(["my-classes", "explore"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab === "my-classes" ? (en ? "My Classes" : "Madarasa Yangu") : (en ? "Explore" : "Gundua")}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Tab content ── */}
          <motion.div variants={fadeUp} className="min-h-[200px]">
            {activeTab === "my-classes" && (
              <ClassesSection
                isLoading={isLoadingClasses}
                classes={filteredMyClasses}
                language={language}
                joinedClassIds={joinedClassIds}
                onOpenClass={(id) => navigate(`/classes/${id}`)}
                currentUserId={user?.id}
                onEditClass={openEditDialog}
                onDeleteClass={handleDeleteClass}
                onJoinByCode={joinClassByCode}
                onPrimaryAction={() => setIsJoinDialogOpen(true)}
                onSecondaryAction={() => setIsCreateDialogOpen(true)}
              />
            )}

            {activeTab === "explore" && (
              <div className="space-y-4">
                {searchQuery.trim().length < 2 ? (
                  <p className="px-1 text-sm text-muted-foreground">
                    {en ? "Use the search bar above to explore public classes." : "Tumia upau wa kutafuta hapo juu kugundua madarasa ya umma."}
                  </p>
                ) : isSearching ? (
                  <div className="flex items-center gap-3 rounded-[28px] border border-border/70 bg-card/85 px-5 py-8 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">{en ? "Searching classes..." : "Inatafuta madarasa..."}</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ClassesSection
                    isLoading={false}
                    classes={searchResults}
                    language={language}
                    joinedClassIds={joinedClassIds}
                    onOpenClass={(id) => navigate(`/classes/${id}`)}
                    currentUserId={user?.id}
                    onEditClass={openEditDialog}
                    onDeleteClass={handleDeleteClass}
                    onJoinByCode={joinClassByCode}
                    showJoinAction
                    label={en ? "Results" : "Matokeo"}
                  />
                ) : (
                  <div className="rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
                    <p className="text-sm font-semibold text-foreground">{en ? "No classes found" : "Hakuna madarasa yaliyopatikana"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{en ? "Try another class name or paste the exact class code." : "Jaribu jina lingine au bandika msimbo sahihi."}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* ── Join dialog with QR scan ── */}
      <Dialog open={isJoinDialogOpen} onOpenChange={(open) => { setIsJoinDialogOpen(open); if (!open) setJoinScanMode("code"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{en ? "Join a class" : "Jiunge na darasa"}</DialogTitle>
            <DialogDescription>
              {en ? "Enter the class code or scan a QR code to join." : "Weka msimbo wa darasa au skani QR code kujiunga."}
            </DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 rounded-2xl bg-muted p-1">
            <button
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                joinScanMode === "code"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setJoinScanMode("code")}
            >
              <Keyboard className="h-4 w-4" />
              {en ? "Type Code" : "Andika Msimbo"}
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                joinScanMode === "camera"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setJoinScanMode("camera")}
            >
              <Camera className="h-4 w-4" />
              {en ? "Scan QR" : "Skani QR"}
            </button>
          </div>

          {joinScanMode === "code" ? (
            <div className="space-y-2">
              <Label htmlFor="class-code">{en ? "Class code" : "Msimbo wa darasa"}</Label>
              <Input
                id="class-code"
                value={joinCode}
                onChange={(e) => {
                  const res = parseClassJoinQrResult(e.target.value);
                  setJoinCode(res.classCode);
                }}
                placeholder="ABC123"
              />
            </div>
          ) : (
            <QrScanner
              label={en ? "Point camera at a class QR code" : "Elekeza kamera kwenye QR code ya darasa"}
              onScan={(text) => {
                const res = parseClassJoinQrResult(text);
                setJoinCode(res.classCode);
                setJoinScanMode("code");
                toast({
                  title: en ? "QR scanned!" : "QR imesomwa!",
                  description: en
                    ? `Class code: ${res.classCode}${res.className ? ` — ${res.className}` : ""}`
                    : `Msimbo wa darasa: ${res.classCode}${res.className ? ` — ${res.className}` : ""}`,
                });
              }}
              onError={(err) => {
                toast({
                  title: en ? "Camera error" : "Hitilafu ya kamera",
                  description: err,
                  variant: "destructive",
                });
              }}
            />
          )}

          {/* Show scanned code preview when code is filled */}
          {joinCode && joinScanMode === "code" && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3">
              <Hash className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{joinCode}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>{en ? "Cancel" : "Ghairi"}</Button>
            <Button onClick={handleJoinClass} disabled={isJoining || !joinCode}>
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {en ? "Join class" : "Jiunge na darasa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create dialog (unchanged) ── */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{en ? "Create a class" : "Unda darasa"}</DialogTitle>
            <DialogDescription>
              {en ? "Set up a class, invite members with the generated code, and start sharing resources." : "Sanidi darasa, waalike wanachama kwa msimbo utakaotengenezwa, na anza kushiriki rasilimali."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">{en ? "Class name" : "Jina la darasa"}</Label>
              <Input id="class-name" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} placeholder={en ? "Algorithms" : "Algorithms"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-description">{en ? "Description" : "Maelezo"}</Label>
              <Textarea id="class-description" value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} placeholder={en ? "Class for data structures and algorithms" : "Darasa la miundo ya data na algorithimu"} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{en ? "Public class" : "Darasa la umma"}</p>
                <p className="text-xs text-muted-foreground">{en ? "Public classes appear in class search." : "Madarasa ya umma yanaonekana kwenye utafutaji."}</p>
              </div>
              <Switch checked={createForm.is_public} onCheckedChange={(v) => setCreateForm((f) => ({ ...f, is_public: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{en ? "Cancel" : "Ghairi"}</Button>
            <Button onClick={handleCreateClass} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {en ? "Create class" : "Unda darasa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

/* ─────────────────────── ClassesSection component ─────────────────────── */

function ClassesSection({
  isLoading,
  classes,
  language,
  joinedClassIds,
  onOpenClass,
  onJoinByCode,
  onPrimaryAction,
  onSecondaryAction,
  showJoinAction = false,
  label,
  currentUserId,
  onEditClass,
  onDeleteClass,
}: {
  isLoading: boolean;
  classes: ClassData[];
  language: string;
  joinedClassIds: Set<string>;
  onOpenClass: (id: string) => void;
  onJoinByCode: (code: string) => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  showJoinAction?: boolean;
  label?: string;
  currentUserId?: string | number | null;
  onEditClass?: (cls: ClassData) => void;
  onDeleteClass?: (classId: string) => void;
}) {
  const en = language === "en";
  const sectionLabel = label ?? (en ? "Classes" : "Madarasa");
  const countText = en
    ? `${classes.length} ${classes.length === 1 ? "class" : "classes"}`
    : `Madarasa ${classes.length}`;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/70 bg-card/85 p-[22px] shadow-sm">
            <div className="flex gap-[14px]">
              <Skeleton className="h-[52px] w-[52px] rounded-2xl" />
              <div className="flex-1 space-y-2 mt-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="mt-[18px] flex gap-[22px]">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="mt-[16px] h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
        <div className="mx-auto mb-4 w-fit rounded-2xl bg-primary/10 p-4 text-primary">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{en ? "No classes yet" : "Bado hakuna madarasa"}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          {en ? "Join a class using a code or create your own to get started." : "Jiunge na darasa kwa msimbo au unda lako mwenyewe kuanza."}
        </p>
        {onPrimaryAction && (
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={onPrimaryAction} variant="hero" className="rounded-2xl">{en ? "Join a class" : "Jiunge na darasa"}</Button>
            <Button variant="outline" onClick={onSecondaryAction} className="rounded-2xl border-border">{en ? "Create class" : "Unda darasa"}</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
      {classes.map((classItem) => {
        const alreadyJoined = joinedClassIds.has(classItem.id);
        const canJoin = showJoinAction && !alreadyJoined;
        return (
          <ClassItem
            key={classItem.id}
            classItem={classItem}
            language={language}
            alreadyJoined={alreadyJoined}
            canJoin={canJoin}
            showJoinAction={showJoinAction}
            isCreator={String(classItem.creator) === String(currentUserId)}
            onOpen={() => onOpenClass(classItem.id)}
            onJoin={() => onJoinByCode(classItem.class_code)}
            onEdit={() => onEditClass?.(classItem)}
            onDelete={() => onDeleteClass?.(classItem.id)}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────── ClassItem component ─────────────────────── */

function ClassItem({
  classItem,
  language,
  alreadyJoined,
  canJoin,
  showJoinAction,
  isCreator,
  onOpen,
  onJoin,
  onEdit,
  onDelete,
}: {
  classItem: ClassData;
  language: string;
  alreadyJoined: boolean;
  canJoin: boolean;
  showJoinAction: boolean;
  isCreator?: boolean;
  onOpen: () => void;
  onJoin: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [showQr, setShowQr] = useState(false);
  const en = language === "en";
  const typeLabel = classItem.is_verified
    ? en ? "Verified class" : "Imethibitishwa"
    : en ? "Study group" : "Kikundi cha masomo";
    
  const members = classItem.member_count || 0;
  
  // Deterministic color generation based on classItem.id
  const colors = [
    "hsl(210, 100%, 50%)", // primary-ish
    "hsl(258, 55%, 50%)", 
    "hsl(160, 60%, 38%)",
    "hsl(330, 60%, 50%)",
    "hsl(20, 80%, 55%)"
  ];
  const charSum = classItem.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = colors[charSum % colors.length];

  return (
    <div className="rounded-[24px] border border-border/70 bg-card p-[22px] shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-[14px]">
          <div 
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[17px] font-bold leading-tight text-foreground">{classItem.name}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              {classItem.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
              {typeLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary">
            {classItem.class_code}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowQr((v) => !v); }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title={en ? "Show QR Code" : "Onyesha QR Code"}
          >
            {showQr ? <X className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* QR code reveal */}
      {showQr && (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border bg-muted/30 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {classItem.join_qr_image ? (
            <>
              <div className="rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-border">
                <img
                  src={classItem.join_qr_image}
                  alt={`QR for ${classItem.name}`}
                  className="h-36 w-36 object-contain"
                />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-foreground">
                {en ? "Scan to join" : "Skani kujiunga"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {en ? `Code: ${classItem.class_code}` : `Msimbo: ${classItem.class_code}`}
              </p>
            </>
          ) : classItem.class_code ? (
            <>
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: "class_join",
                    class_code: classItem.class_code,
                    class_name: classItem.name,
                  })}
                  size={144}
                  level="M"
                />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-foreground">
                {en ? "Scan to join" : "Skani kujiunga"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {en ? `Code: ${classItem.class_code}` : `Msimbo: ${classItem.class_code}`}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <QrCode className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-[12px] text-muted-foreground">
                {en ? "QR code not available yet" : "QR code bado haipatikani"}
              </p>
              <p className="text-[11px] font-semibold text-primary">
                {en ? `Share code: ${classItem.class_code}` : `Shiriki msimbo: ${classItem.class_code}`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-[18px] flex items-center justify-between gap-[22px]">
        <div className="flex gap-[22px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[15px] font-bold leading-tight">{members}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{en ? "Members" : "Wanachama"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[15px] font-bold leading-tight">{classItem.file_count || 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{en ? "Files" : "Faili"}</div>
            </div>
          </div>
        </div>
        
        {isCreator && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title={en ? "Edit Class" : "Hariri Darasa"}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title={en ? "Delete Class" : "Futa Darasa"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {canJoin ? (
        <Button
          onClick={(e) => { e.stopPropagation(); onJoin(); }}
          variant="hero"
          className="mt-[16px] w-full rounded-xl"
        >
          {en ? "Join Class" : "Jiunge na Darasa"}
        </Button>
      ) : showJoinAction && alreadyJoined ? (
        <Button
          onClick={onOpen}
          variant="outline"
          className="mt-[16px] w-full rounded-xl border-border hover:bg-muted"
        >
          {en ? "Open Class" : "Fungua Darasa"} <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onOpen}
          variant="outline"
          className="mt-[16px] w-full rounded-xl border-border hover:bg-muted"
        >
          {en ? "Open Class" : "Fungua Darasa"} <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────── Utility functions (unchanged) ─────────────────────── */

function normalizeClassList(payload: any): ClassData[] {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizeClassPayload(payload: any): ClassData {
  return payload?.data ?? payload;
}

export default Classes;
