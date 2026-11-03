import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, FileText, Image as ImageIcon, FileArchive, File as FileIcon,
  GraduationCap, ArrowLeft, Paperclip, Send, X, Reply,
  Users, Info, Download, Share2, Lock, Globe, MessageSquare, Trash2
} from "lucide-react";
import FilePreview from "@/components/FilePreview";
import { FileData } from "@/services/fileService";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import classService, {
  ClassDetailsData, RecentUpload, UploaderStat, MemberData,
} from "@/services/classService";
import uploadService from "@/services/uploadService";
import sharingService from "@/services/sharingService";
import friendsService, { UserInfo } from "@/services/friendsService";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
type TabKey = "chat" | "files" | "members" | "about";

interface ChatItem {
  id: string;
  type: "file_upload" | "system";
  sender: { id: string; name: string; userType: "lecturer" | "student" };
  timestamp: Date;
  upload?: RecentUpload;
  systemText?: string;
}

/* ─── Utilities (preserved from original) ─── */
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 bytes";
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const getFileIcon = (fileType: string) => {
  const lower = fileType.toLowerCase();
  if (lower.includes("image")) return <ImageIcon className="h-5 w-5" />;
  if (lower.includes("presentation") || lower.includes("ppt")) return <FileText className="h-5 w-5" />;
  if (lower.includes("spreadsheet") || lower.includes("sheet") || lower.includes("excel")) return <FileArchive className="h-5 w-5" />;
  if (lower.includes("document") || lower.includes("pdf") || lower.includes("doc")) return <FileText className="h-5 w-5" />;
  return <FileIcon className="h-5 w-5" />;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDateLabel = (date: Date, en: boolean): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return en ? "Today" : "Leo";
  if (date.toDateString() === yesterday.toDateString()) return en ? "Yesterday" : "Jana";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
};

const groupByDay = (items: ChatItem[], en: boolean) => {
  const map = new Map<string, { label: string; items: ChatItem[] }>();
  for (const item of items) {
    const key = item.timestamp.toDateString();
    if (!map.has(key)) map.set(key, { label: formatDateLabel(item.timestamp, en), items: [] });
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
};

const normList = (r: any): any[] => {
  if (Array.isArray(r?.results)) return r.results;
  if (Array.isArray(r?.data?.results)) return r.data.results;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r)) return r;
  return [];
};

/* ─── Main Component ─── */
const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const en = language === "en";

  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<ClassDetailsData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatItem | null>(null);
  const [composerText, setComposerText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Share dialog (all preserved from original)
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<RecentUpload | null>(null);
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  // Preview dialog (preserved)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (id) fetchClassDetails(id);
  }, [user, id, navigate]);

  useEffect(() => {
    if (!isLoading && activeTab === "chat") {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, [isLoading, activeTab]);

  /* ─── API handlers (all identical to original) ─── */
  const fetchClassDetails = async (classId: string) => {
    setIsLoading(true);
    try {
      const response = await classService.getClassDetails(classId);
      const classData = response.data;
      if (!classData) throw new Error("No data received from API");
      setClassDetails(classData);
    } catch (error: any) {
      toast({ title: t.classesError || "Failed to load class", description: error.response?.data?.message || error.message || "Could not load this class.", variant: "destructive" });
      if (error.response?.status === 404) setTimeout(() => navigate("/classes"), 2000);
    } finally { setIsLoading(false); }
  };

  const fetchMembers = async () => {
    if (!id) return;
    setIsLoadingMembers(true);
    try {
      const res = await classService.getMembers(id);
      setMembers(normList(res));
    } catch (error: any) {
      toast({ title: en ? "Failed to load members" : "Imeshindwa kupakia wanachama", description: error.message, variant: "destructive" });
    } finally { setIsLoadingMembers(false); }
  };

  const handleDownload = async (upload: RecentUpload) => {
    try {
      setIsDownloadingId(upload.id);
      await uploadService.downloadFile(upload.file_code, upload.file_name);
      toast({ title: t.filesDownloadSuccess || "Download started", description: t.filesDownloadSuccessDesc || "Your file is downloading." });
    } catch (error: any) {
      toast({ title: t.filesDownloadFailed || "Download failed", description: error.response?.data?.message || "Could not download.", variant: "destructive" });
    } finally { setIsDownloadingId(null); }
  };

  const handleFileClick = (upload: RecentUpload) => {
    const fileData: FileData = {
      id: upload.id, file_code: upload.file_code, file_name: upload.file_name,
      file_size: upload.file_size, file_type: upload.file_type, file_url: "",
      source: "upload",
      owner: { id: upload.uploader_id, email: "", full_name: upload.uploader_name, user_type: upload.uploader_type as "student" | "lecturer" },
      uploaded_at: upload.created_at, is_deleted: false, deleted_at: null, shared_by: null, shared_at: null, accepted: null,
    };
    setPreviewFile(fileData);
    setPreviewDialogOpen(true);
  };

  const handlePreviewDownload = async (file: FileData) => {
    const upload = (classDetails?.recent_uploads || []).find(u => u.file_code === file.file_code);
    if (upload) await handleDownload(upload);
  };

  const handleShareClick = async (upload: RecentUpload) => {
    setSelectedUpload(upload); setShareDialogOpen(true);
    setSelectedFriend(""); setFriendSearchQuery(""); setShareMessage("");
    setIsLoadingFriends(true);
    try {
      const response = await friendsService.getFriends("accepted");
      setFriends(response.results.map((f: any) => f.friend_info) || []);
    } catch { setFriends([]); }
    finally { setIsLoadingFriends(false); }
  };

  const handleShare = async () => {
    if (!selectedUpload || !selectedFriend) { toast({ title: t.filesShareFailed || "Share Failed", description: en ? "Select a file and a friend." : "Chagua faili na rafiki.", variant: "destructive" }); return; }
    if (!selectedUpload.file_code?.trim()) { toast({ title: t.filesShareFailed || "Share Failed", description: en ? "Invalid file." : "Faili si halali.", variant: "destructive" }); return; }
    if (!user || String(selectedUpload.uploader_id) !== String(user.id)) { toast({ title: t.filesShareFailed || "Share Failed", description: en ? "Only the file owner can share." : "Mwenye faili peke yake anaweza kushiriki.", variant: "destructive" }); return; }
    setIsSharing(true);
    try {
      const response = await sharingService.shareFile(selectedUpload.file_code, selectedFriend.trim(), shareMessage);
      toast({ title: t.filesSharedSuccess || "File Shared", description: response.message || "Shared successfully." });
      setShareDialogOpen(false); setSelectedFriend(""); setShareMessage(""); setSelectedUpload(null);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Could not share.";
      toast({ title: t.filesShareFailed || "Share Failed", description: msg, variant: "destructive" });
    } finally { setIsSharing(false); }
  };

  const handleSend = () => {
    if (!composerText.trim() && !attachedFile) return;
    toast({ title: en ? "Coming Soon" : "Inakuja Hivi Karibuni", description: en ? "Text messaging will be available soon." : "Ujumbe wa maandishi utapatikana hivi karibuni." });
    setComposerText(""); setAttachedFile(null); setReplyingTo(null);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "members" && members.length === 0) fetchMembers();
  };

  /* ─── Derived chat stream ─── */
  const chatItems = useMemo((): ChatItem[] => {
    if (!classDetails) return [];
    const items: ChatItem[] = [];
    items.push({
      id: "system-created", type: "system",
      sender: { id: "system", name: "Kibegi", userType: "lecturer" },
      timestamp: new Date(classDetails.created_at),
      systemText: en ? `Class "${classDetails.name}" was created by ${classDetails.creator_name}.` : `Darasa "${classDetails.name}" liliundwa na ${classDetails.creator_name}.`,
    });
    for (const upload of (classDetails.recent_uploads || [])) {
      items.push({
        id: upload.id, type: "file_upload",
        sender: { id: upload.uploader_id, name: upload.uploader_name, userType: upload.uploader_type },
        timestamp: new Date(upload.created_at),
        upload,
      });
    }
    return items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [classDetails, en]);

  const dayGroups = useMemo(() => groupByDay(chatItems, en), [chatItems, en]);

  const recentUploads = classDetails?.recent_uploads || [];
  const uploadsSummary = classDetails?.uploads_summary;
  const uploaderStats = classDetails?.uploader_stats || [];

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: en ? "Chat" : "Mazungumzo", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { key: "files", label: en ? "Files" : "Faili", icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "members", label: en ? "Members" : "Wanachama", icon: <Users className="h-3.5 w-3.5" /> },
    { key: "about", label: en ? "About" : "Kuhusu", icon: <Info className="h-3.5 w-3.5" /> },
  ];

  const isOwn = (item: ChatItem) => user && String(item.sender.id) === String(user.id);

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: activeTab === "chat" ? "152px" : "88px" }}>
      <DashboardNav userRole={(user?.user_type as "student" | "lecturer") || "student"} userName={user?.full_name || user?.email || ""} hideGlobalSearch />

      {/* ── Compact class header ── */}
      {classDetails && (
        <div className="sticky top-[64px] z-20 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md">
          <div className="container max-w-3xl flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex-shrink-0 rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{classDetails.name}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <Badge variant={classDetails.is_verified ? "default" : "secondary"} className="h-4 px-1.5 text-[9px]">
                  {classDetails.is_verified ? (en ? "Verified" : "Imethibitishwa") : (en ? "Study Group" : "Kikundi")}
                </Badge>
                {classDetails.is_public ? <Globe className="h-3 w-3 text-muted-foreground" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                <span className="font-mono text-[9px] text-muted-foreground">{classDetails.class_code}</span>
                <span className="text-[9px] text-muted-foreground">· {classDetails.member_count} {en ? "members" : "wanachama"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      {classDetails && (
        <div className="sticky top-[128px] z-20 border-b border-border/60 bg-background/95 backdrop-blur-md">
          <div className="container max-w-3xl flex">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${activeTab === tab.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="container max-w-3xl px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !classDetails ? (
          <Alert className="max-w-xl mx-auto mt-8"><AlertDescription>{t.classesFailedToLoadClasses || "Could not load this class."}</AlertDescription></Alert>
        ) : (
          <>
            {/* ── CHAT TAB ── */}
            {activeTab === "chat" && (
              <div className="space-y-1">
                {dayGroups.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 rounded-3xl bg-primary/10 p-6 text-primary"><GraduationCap className="h-10 w-10" /></div>
                    <p className="text-base font-semibold text-foreground">{en ? "Class is ready" : "Darasa liko tayari"}</p>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">{en ? "Files uploaded to this class will appear here as messages." : "Faili zilizopakiwa zitaonekana hapa."}</p>
                  </div>
                )}
                {dayGroups.map(group => (
                  <div key={group.label}>
                    <div className="flex items-center justify-center py-4">
                      <span className="rounded-full border border-border/70 bg-card/80 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">{group.label}</span>
                    </div>
                    <div className="space-y-3">
                      {group.items.map(item => (
                        <ChatItemRow
                          key={item.id}
                          item={item}
                          isOwn={!!isOwn(item)}
                          onReply={() => setReplyingTo(item)}
                          onDownload={item.upload ? () => handleDownload(item.upload!) : undefined}
                          onShare={item.upload && user && String(item.upload.uploader_id) === String(user.id) ? () => handleShareClick(item.upload!) : undefined}
                          onFileClick={item.upload ? () => handleFileClick(item.upload!) : undefined}
                          isDownloading={item.upload?.id === isDownloadingId}
                          en={en}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* ── FILES TAB ── */}
            {activeTab === "files" && (
              recentUploads.length === 0 ? (
                <EmptyState icon={<FileText className="h-7 w-7" />} title={en ? "No files yet" : "Bado hakuna faili"} desc={en ? "Files shared in this class will appear here." : "Faili zilizoshirikiwa zitaonekana hapa."} />
              ) : (
                <SectionCard label={en ? "Files" : "Faili"} count={recentUploads.length} countSuffix={en ? "files" : "faili"}>
                  {recentUploads.map((upload, i) => (
                    <div key={upload.id}>
                      <div className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-muted/40" onClick={() => handleFileClick(upload)}>
                        <div className="flex-shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">{getFileIcon(upload.file_type)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{upload.file_name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{upload.uploader_name} · {formatFileSize(upload.file_size)}</p>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 rounded-xl p-0" onClick={() => handleDownload(upload)} disabled={isDownloadingId === upload.id}>
                            {isDownloadingId === upload.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </Button>
                          {user && String(upload.uploader_id) === String(user.id) && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-xl p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40" onClick={() => handleShareClick(upload)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {i < recentUploads.length - 1 && <div className="mx-5 h-px bg-border/60" />}
                    </div>
                  ))}
                </SectionCard>
              )
            )}

            {/* ── MEMBERS TAB ── */}
            {activeTab === "members" && (
              isLoadingMembers ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
              ) : members.length === 0 ? (
                <EmptyState icon={<Users className="h-7 w-7" />} title={en ? "No members found" : "Hakuna wanachama"} desc="" />
              ) : (
                <SectionCard label={en ? "Members" : "Wanachama"} count={members.length}>
                  {members.map((m, i) => (
                    <div key={m.id}>
                      <div className="flex items-center gap-4 px-5 py-3.5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {m.full_name ? m.full_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{m.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <Badge variant={m.role === "lecturer" ? "default" : "secondary"} className="text-[10px] capitalize flex-shrink-0">{m.role}</Badge>
                      </div>
                      {i < members.length - 1 && <div className="mx-5 h-px bg-border/60" />}
                    </div>
                  ))}
                </SectionCard>
              )
            )}

            {/* ── ABOUT TAB ── */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <SectionCard label={en ? "Class Info" : "Taarifa za Darasa"}>
                  {[
                    { label: en ? "Class name" : "Jina la darasa", value: classDetails.name },
                    { label: en ? "Description" : "Maelezo", value: classDetails.description || (en ? "No description" : "Hakuna maelezo") },
                    { label: en ? "Class code" : "Msimbo", value: classDetails.class_code },
                    { label: en ? "Creator" : "Muundaji", value: classDetails.creator_name },
                    { label: en ? "Members" : "Wanachama", value: String(classDetails.member_count) },
                    { label: en ? "Privacy" : "Faragha", value: classDetails.is_public ? (en ? "Public" : "Ya umma") : (en ? "Private" : "Binafsi") },
                    { label: en ? "Status" : "Hali", value: classDetails.is_verified ? (en ? "Verified" : "Imethibitishwa") : (en ? "Study Group" : "Kikundi") },
                    { label: en ? "Created" : "Iliundwa", value: new Date(classDetails.created_at).toLocaleDateString() },
                  ].map((row, i, arr) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between px-5 py-4">
                        <p className="text-sm text-muted-foreground">{row.label}</p>
                        <p className="max-w-[55%] truncate text-right text-sm font-semibold text-foreground">{row.value}</p>
                      </div>
                      {i < arr.length - 1 && <div className="mx-5 h-px bg-border/60" />}
                    </div>
                  ))}
                </SectionCard>

                {classDetails.join_qr_image && (
                  <SectionCard label={en ? "Class QR Code" : "QR Code ya Darasa"}>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-border">
                        <img
                          src={classDetails.join_qr_image}
                          alt={`Join QR for ${classDetails.name}`}
                          className="h-40 w-40 object-contain"
                        />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {en ? "Scan to join this class" : "Skani kujiunga na darasa hili"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {en ? `Class Code: ${classDetails.class_code}` : `Msimbo wa Darasa: ${classDetails.class_code}`}
                      </p>
                    </div>
                  </SectionCard>
                )}

                {uploadsSummary && (
                  <SectionCard label={en ? "Upload Stats" : "Takwimu za Upakiaji"}>
                    {[
                      { label: en ? "Total files" : "Faili zote", value: String(uploadsSummary.total_uploads ?? 0) },
                      { label: en ? "Total size" : "Ukubwa wote", value: uploadsSummary.total_size_mb ? `${uploadsSummary.total_size_mb.toFixed(1)} MB` : formatFileSize(uploadsSummary.total_size_bytes || 0) },
                      { label: en ? "Lecturers uploading" : "Walimu wanaopakia", value: String(uploadsSummary.lecturers_with_uploads ?? 0) },
                      { label: en ? "Active contributors" : "Wachangiaji", value: String(uploadsSummary.active_contributors ?? 0) },
                    ].map((row, i, arr) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between px-5 py-4">
                          <p className="text-sm text-muted-foreground">{row.label}</p>
                          <p className="text-sm font-bold text-foreground">{row.value}</p>
                        </div>
                        {i < arr.length - 1 && <div className="mx-5 h-px bg-border/60" />}
                      </div>
                    ))}
                  </SectionCard>
                )}

                {uploaderStats.length > 0 && (
                  <SectionCard label={en ? "Top Contributors" : "Wachangiaji Wakuu"}>
                    {uploaderStats.map((u: UploaderStat, i, arr) => (
                      <div key={u.uploader_id}>
                        <div className="flex items-center justify-between px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {u.uploader_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{u.uploader_name}</p>
                              <p className="text-xs capitalize text-muted-foreground">{u.uploader_type}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{u.upload_count} {en ? "uploads" : "faili"}</Badge>
                        </div>
                        {i < arr.length - 1 && <div className="mx-5 h-px bg-border/60" />}
                      </div>
                    ))}
                  </SectionCard>
                )}

                {String(classDetails.creator) === String(user?.id) && (
                  <div className="pt-2">
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-2xl"
                      onClick={async () => {
                        if (window.confirm(en ? "Are you sure you want to delete this class? This action cannot be undone." : "Je, una uhakika unataka kufuta darasa hili? Kitendo hiki hakiwezi kutenduliwa.")) {
                          try {
                            await classService.deleteClass(classDetails.id);
                            toast({
                              title: en ? "Success" : "Imefanikiwa",
                              description: en ? "Class deleted successfully" : "Darasa limefutwa kikamilifu",
                            });
                            navigate("/classes");
                          } catch (err: any) {
                            console.error("Delete failed:", err);
                            toast({
                              title: en ? "Error" : "Hitilafu",
                              description: err.response?.data?.error || (en ? "Failed to delete class" : "Imeshindwa kufuta darasa"),
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {en ? "Delete Class" : "Futa Darasa"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Sticky Composer (chat tab only) ── */}
      {activeTab === "chat" && classDetails && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-3xl space-y-2">
            {replyingTo && (
              <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary">{replyingTo.sender.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {replyingTo.type === "file_upload" && replyingTo.upload ? `📎 ${replyingTo.upload.file_name}` : replyingTo.systemText?.slice(0, 60)}
                  </p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="flex-shrink-0 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            )}
            {attachedFile && (
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-3 py-2">
                <Paperclip className="h-4 w-4 flex-shrink-0 text-primary" />
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{attachedFile.name}</p>
                <button onClick={() => setAttachedFile(null)} className="flex-shrink-0 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input type="file" ref={attachRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setAttachedFile(f); e.target.value = ""; }} />
              <button onClick={() => attachRef.current?.click()} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 rounded-2xl border border-border/70 bg-muted/40 px-4 py-2.5">
                <textarea
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={en ? "Type a message..." : "Andika ujumbe..."}
                  rows={1}
                  className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!composerText.trim() && !attachedFile}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Dialog (preserved) ── */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.filesShareDialogTitle || "Share File"}</DialogTitle>
            <DialogDescription>{t.filesShareDialogDesc || "Share files with your friends."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="friend-search">{t.filesSearchFriend || "Search Friend"}</Label>
              <Input id="friend-search" placeholder={t.filesSearchFriendPlaceholder || "Type friend name..."} value={friendSearchQuery} onChange={e => setFriendSearchQuery(e.target.value)} disabled={isLoadingFriends || isSharing} autoFocus />
              {isLoadingFriends ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2"><Loader2 className="h-4 w-4 animate-spin" />{t.filesLoadingFriends || "Loading friends..."}</div>
              ) : friends.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">{t.filesNoFriendsAvailable || "No friends available"}</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                  {friends.filter(f => { const q = friendSearchQuery.toLowerCase(); return f.full_name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q); }).map(friend => (
                    <button key={friend.id} type="button" onClick={() => { setSelectedFriend(friend.id.toString()); setFriendSearchQuery(friend.full_name); }} disabled={isSharing} className={`w-full text-left p-3 hover:bg-accent transition-colors border-b last:border-b-0 ${selectedFriend === friend.id.toString() ? "bg-accent" : ""}`}>
                      <div className="font-medium text-sm truncate">{friend.full_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{friend.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="share-message">{t.filesMessage || "Message (optional)"}</Label>
              <Textarea id="share-message" placeholder={t.filesMessagePlaceholder || "Add a message..."} value={shareMessage} onChange={e => setShareMessage(e.target.value)} maxLength={500} rows={3} disabled={isSharing} className="resize-none" />
              <p className="text-xs text-muted-foreground text-right">{shareMessage.length}/500</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)} disabled={isSharing} className="flex-1">{t.cancel || "Cancel"}</Button>
              <Button onClick={handleShare} disabled={isSharing || !selectedFriend || isLoadingFriends} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isSharing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
                {t.filesShareButton || "Share"}
              </Button>
            </div>
          </div>
          <DialogFooter className="hidden" />
        </DialogContent>
      </Dialog>

      <FilePreview file={previewFile} open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} onDownload={handlePreviewDownload} />
      <BottomNav />
    </div>
  );
};

/* ─── ChatItemRow ─── */
interface ChatItemRowProps {
  item: ChatItem;
  isOwn: boolean;
  onReply: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onFileClick?: () => void;
  isDownloading?: boolean;
  en: boolean;
}

const ChatItemRow = ({ item, isOwn, onReply, onDownload, onShare, onFileClick, isDownloading, en }: ChatItemRowProps) => {
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const THRESHOLD = 60;

  const onTouchStart = (e: React.TouchEvent) => { setStartX(e.touches[0].clientX); setDragging(true); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = startX - e.touches[0].clientX;
    if (dx > 0) setSwipeX(Math.min(dx, THRESHOLD));
  };
  const onTouchEnd = () => {
    if (swipeX >= THRESHOLD * 0.75) onReply();
    setSwipeX(0); setDragging(false);
  };

  if (item.type === "system") {
    return (
      <div className="flex items-center justify-center py-1">
        <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[10px] text-muted-foreground">{item.systemText}</span>
      </div>
    );
  }

  if (item.type === "file_upload" && item.upload) {
    const upload = item.upload;
    return (
      <div className={`group flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className="max-w-[85%] sm:max-w-[75%]"
          style={{ transform: `translateX(-${swipeX}px)`, transition: dragging ? "none" : "transform 0.2s ease" }}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          {!isOwn && (
            <p className="mb-1 px-1 text-[10px] font-semibold text-primary">
              {item.sender.name}
              <span className="ml-1.5 font-normal text-muted-foreground capitalize">{item.sender.userType}</span>
            </p>
          )}
          <div
            className={`cursor-pointer overflow-hidden rounded-[20px] border shadow-sm transition hover:shadow-md ${isOwn ? "border-primary/20 bg-primary/5" : "border-border/70 bg-card/90"}`}
            onClick={onFileClick}
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">{getFileIcon(upload.file_type)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{upload.file_name}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">{upload.file_type} · {formatFileSize(upload.file_size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 border-t border-border/60 px-4 py-2.5" onClick={e => e.stopPropagation()}>
              {onDownload && (
                <button onClick={onDownload} disabled={isDownloading} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10">
                  {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {en ? "Download" : "Pakua"}
                </button>
              )}
              {onShare && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <button onClick={onShare} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40">
                    <Share2 className="h-3.5 w-3.5" />
                    {en ? "Share" : "Shiriki"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={`mt-1 flex items-center gap-2 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] text-muted-foreground">{formatTime(item.timestamp)}</span>
            <button onClick={onReply} className="hidden items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] text-muted-foreground transition hover:bg-muted hover:text-foreground group-hover:flex">
              <Reply className="h-3 w-3" />
              {en ? "Reply" : "Jibu"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Shared UI helpers ─── */
const SectionCard = ({ label, count, countSuffix, children }: { label: string; count?: number; countSuffix?: string; children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      {count !== undefined && (
        <Badge className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold text-primary hover:bg-primary/5">
          {count}{countSuffix ? ` ${countSuffix}` : ""}
        </Badge>
      )}
    </div>
    <div className="border-t border-border/60">{children}</div>
  </div>
);

const EmptyState = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
    <div className="mx-auto mb-4 w-fit rounded-2xl bg-primary/10 p-4 text-primary">{icon}</div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
  </div>
);

export default ClassDetails;
