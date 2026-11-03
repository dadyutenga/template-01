import { useEffect, useState, useCallback } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import libraryService, {
  LibraryItem, LibraryCategory
} from "@/services/libraryService";
import {
  BookOpen, Plus, Loader2, FileText, Download, User,
  FilePlus, Trash2, FileArchive, FileSpreadsheet, FileIcon, ChevronRight
} from "lucide-react";
import api from '@/lib/api';

const getFileIcon = (type: string) => {
  if (!type) return <FileIcon className="h-8 w-8 text-primary" />;
  const t = type.toLowerCase();
  if (t.includes("pdf")) return <FileText className="h-8 w-8 text-red-400" />;
  if (t.includes("zip") || t.includes("rar") || t.includes("archive")) return <FileArchive className="h-8 w-8 text-amber-500" />;
  if (t.includes("sheet") || t.includes("excel") || t.includes("csv")) return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
  return <FileIcon className="h-8 w-8 text-primary" />;
};

// ── Main Component ───────────────────────────────────────────────────────────

const Library = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const en = language === "en";

  // Data
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<"browse" | "my">("browse");
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<LibraryItem | null>(null);

  // Create form
  const [cf, setCf] = useState({ title: "", description: "", category: "" });
  const [cfFile, setCfFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setCategories(await libraryService.getCategories());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchItems = useCallback(async (p = 1, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await libraryService.getItems({
        page: p,
        q: searchQ || undefined,
        category: catFilter || undefined,
      });
      if (reset) setItems(res.items);
      else setItems(prev => [...prev, ...res.items]);
      setHasNext(res.next);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQ, catFilter]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load items on filters change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchItems(1, true);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQ, catFilter, fetchItems]);

  if (!user) return null;

  // ── My Uploads filtering ──────────────────────────────────────────────────
  // Since there is no explicit /me/ endpoint in the new spec, we filter from loaded items.
  const myItems = items.filter(i => String(i.uploader?.id) === String(user.id));
  const displayItems = tab === "my" ? myItems : items;

  // ── Upload item ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!cf.title) {
      toast({ title: en ? "Title is required" : "Jina linahitajika", variant: "destructive" });
      return;
    }
    if (!cf.category) {
      toast({ title: en ? "Category is required" : "Aina inahitajika", variant: "destructive" });
      return;
    }
    if (!cfFile) {
      toast({ title: en ? "File is required" : "Faili linahitajika", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await libraryService.createItem({ ...cf, file: cfFile });
      toast({ title: en ? "Resource uploaded!" : "Rasilimali imepakiwa!" });
      setCreateOpen(false);
      setCf({ title: "", description: "", category: "" });
      setCfFile(null);
      fetchItems(1, true); // Reload
    } catch (e: any) {
      toast({ title: en ? "Failed to upload" : "Imeshindwa kupakia", description: e?.response?.data?.message || e?.response?.data?.error?.message || e.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownload = (item: LibraryItem) => {
    // Generate the download tracking URL and pass Auth header if possible, 
    // but typically standard anchors don't send auth headers.
    // The backend says GET /items/<code>/download/ returns redirect or direct file stream.
    // We will do a fetch to handle Auth and then trigger the download.
    const url = libraryService.downloadItemUrl(item.code);
    
    toast({ title: en ? "Download started" : "Upakuaji umeanza" });
    
    // Create an invisible iframe or anchor to download it.
    // Since it's a GET, if it requires Auth, we need to fetch it first.
    api.get(`/v1/library/items/${item.code}/download/`, { responseType: 'blob' })
      .then((response) => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = blobUrl;
        // Try to get filename from content-disposition header
        let filename = item.title.replace(/\s+/g, '_') + '.' + (item.file_type || 'bin');
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '');
            }
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        toast({ title: en ? "Download failed" : "Imeshindwa kupakua", description: err.message, variant: "destructive" });
      });
  };

  const isOwner = (item: LibraryItem) => String(user.id) === String(item.uploader?.id);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={(user.user_type as "student" | "lecturer") || "student"}
        userName={user.full_name || user.email || "User"}
        onSearch={setSearchQ}
        searchValue={searchQ}
        searchPlaceholder={en ? "Search notes, past papers…" : "Tafuta notsi, mitihani…"}
      />

      <main className="container px-4 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {en ? "Campus Library" : "Maktaba ya Chuo"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {en ? "Knowledge hub for past papers, notes & books" : "Kituo cha maarifa kwa mitihani, notsi na vitabu"}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full shadow-lg">
            <Plus className="h-4 w-4" /> {en ? "Upload" : "Pakia"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-5">
          {([
            { key: "browse" as const, icon: BookOpen, label: en ? "Browse" : "Tazama" },
            { key: "my" as const, icon: FileText, label: en ? "My Uploads" : "Vipakiwa Vyangu" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === "browse") fetchItems(1, true); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all border-none cursor-pointer ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Browse Tab ────────────────────────────────────────────────── */}
        {tab === "browse" && (
          <>
            {/* Category pills */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                <button
                  onClick={() => setCatFilter("")}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                    !catFilter ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {en ? "All" : "Zote"}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCatFilter(c.slug)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                      catFilter === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Items grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            {tab === "my" ? <FilePlus className="h-14 w-14 text-muted-foreground/40 mb-4" /> : <BookOpen className="h-14 w-14 text-muted-foreground/40 mb-4" />}
            <p className="text-lg font-semibold text-foreground">
              {en 
                ? (tab === "my" ? "No uploads yet" : "No resources found") 
                : (tab === "my" ? "Hujapakia chochote bado" : "Hakuna rasilimali zilizopatikana")}
            </p>
            {tab === "my" && (
              <Button onClick={() => setCreateOpen(true)} className="mt-4 gap-2 rounded-full">
                <Plus className="h-4 w-4" /> {en ? "Upload Resource" : "Pakia Rasilimali"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayItems.map((item) => (
                <LibraryItemCard key={item.code} item={item} en={en} onClick={() => setDetailItem(item)} />
              ))}
            </div>
            
            {tab === "browse" && hasNext && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-full gap-2" 
                  onClick={() => fetchItems(page + 1, false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                  {en ? "Load More" : "Onyesha Zaidi"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Upload Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {en ? "Upload Resource" : "Pakia Rasilimali"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder={en ? "Title (e.g. MATH101 Past Paper 2025)" : "Jina"} value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })} />
            <textarea
              placeholder={en ? "Description (optional)" : "Maelezo (sio lazima)"}
              className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={cf.description} onChange={(e) => setCf({ ...cf, description: e.target.value })}
            />
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={cf.category} onChange={(e) => setCf({ ...cf, category: e.target.value })}
              disabled={categories.length === 0}
            >
              <option value="">
                {categories.length === 0 
                  ? (en ? "No categories available" : "Hakuna aina zilizopo") 
                  : (en ? "Select category" : "Chagua aina")}
              </option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            
            {/* File Input */}
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
              <FilePlus className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {cfFile ? cfFile.name : (en ? "Click to select file" : "Bofya kuchagua faili")}
                </p>
                {cfFile && <p className="text-[12px] text-muted-foreground mt-1">{(cfFile.size / 1024 / 1024).toFixed(2)} MB</p>}
              </div>
              <input type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCfFile(f);
              }} />
            </label>
            
            <Button onClick={handleUpload} disabled={creating} className="w-full rounded-xl h-11">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {en ? "Upload to Library" : "Pakia Maktaba"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {detailItem && (
            <div>
              <div className="bg-muted/40 p-8 flex items-center justify-center border-b border-border">
                {detailItem.thumbnail_url ? (
                  <img src={detailItem.thumbnail_url} alt={detailItem.title} className="max-h-32 rounded-md shadow-sm object-cover" />
                ) : (
                  getFileIcon(detailItem.file_type || "")
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground leading-tight">{detailItem.title}</h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detailItem.category?.name && <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{detailItem.category.name}</span>}
                    {detailItem.file_type && <span className="text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full uppercase">{detailItem.file_type}</span>}
                  </div>
                </div>
                
                {detailItem.description && <p className="text-sm text-muted-foreground">{detailItem.description}</p>}
                
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mt-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{detailItem.uploader?.name || "User"}</p>
                    <p className="text-[11px] text-muted-foreground">{en ? "Uploaded on" : "Imepakiwa"} {new Date(detailItem.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleDownload(detailItem)} className="flex-1 rounded-xl h-11 gap-2">
                    <Download className="h-4 w-4" /> {en ? "Download File" : "Pakua Faili"}
                  </Button>
                  
                  {isOwner(detailItem) && (
                    <Button variant="destructive" className="rounded-xl h-11 w-11 p-0 shrink-0" onClick={async () => {
                      if (confirm(en ? "Delete this resource?" : "Futa rasilimali hii?")) {
                        try {
                          await libraryService.deleteItem(detailItem.code);
                          setDetailItem(null); 
                          fetchItems(1, true);
                          toast({ title: en ? "Deleted" : "Imefutwa" });
                        } catch {}
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

const LibraryItemCard = ({ item, en, onClick }: {
  item: LibraryItem; en: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex items-start gap-3 p-4 bg-background border border-border rounded-2xl text-left transition-all hover:shadow-md hover:border-primary/40 w-full"
  >
    <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors overflow-hidden">
      {item.thumbnail_url ? (
        <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
      ) : (
        getFileIcon(item.file_type || "")
      )}
    </div>
    <div className="flex-1 min-w-0 space-y-1">
      <p className="text-[14px] font-semibold text-foreground line-clamp-1">{item.title}</p>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        {item.category?.name && <span className="font-medium text-primary">{item.category.name}</span>}
        {item.file_type && (
          <>
            <span>•</span>
            <span className="uppercase">{item.file_type}</span>
          </>
        )}
      </div>
    </div>
  </button>
);

export default Library;
