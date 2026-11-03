import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { resolveMediaUrl } from "@/lib/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import marketplaceService, {
  Listing, MarketplaceCategory, ListingCondition, ListingOrder,
} from "@/services/marketplaceService";
import {
  ShoppingBag, Plus, Loader2, Package, MapPin, Tag, User,
  ImagePlus, X, Store, ShoppingCart, Receipt,
} from "lucide-react";

const CONDITIONS: { value: ListingCondition; label: string; sw: string }[] = [
  { value: "new", label: "New", sw: "Mpya" },
  { value: "like_new", label: "Like New", sw: "Kama Mpya" },
  { value: "good", label: "Good", sw: "Nzuri" },
  { value: "fair", label: "Fair", sw: "Wastani" },
  { value: "poor", label: "Poor", sw: "Mbaya" },
];

const conditionColor = (c: string) => {
  const m: Record<string, string> = {
    new: "bg-emerald-500/15 text-emerald-600",
    like_new: "bg-teal-500/15 text-teal-600",
    good: "bg-sky-500/15 text-sky-600",
    fair: "bg-amber-500/15 text-amber-600",
    poor: "bg-red-500/15 text-red-600",
  };
  return m[c] || "bg-muted text-muted-foreground";
};

const getSellerId = (s: Listing["seller"]) =>
  typeof s === "object" && s !== null ? String((s as any).id) : String(s);
const getSellerName = (s: Listing["seller"]) =>
  typeof s === "object" && s !== null ? (s as any).full_name || (s as any).email || "Seller" : "Seller";

// ── Main Component ───────────────────────────────────────────────────────────

const Marketplace = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const en = language === "en";

  // Data
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [orders, setOrders] = useState<ListingOrder[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "my" | "orders">("browse");
  const [orderTab, setOrderTab] = useState<"purchases" | "sales">("purchases");
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Listing | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Create form
  const [cf, setCf] = useState({
    title: "", description: "", price: "", quantity: "1",
    condition: "good" as ListingCondition, location: "", category: 0,
  });
  const [cfImage, setCfImage] = useState<File | null>(null);
  const [cfPreview, setCfPreview] = useState("");
  const [creating, setCreating] = useState(false);

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, c] = await Promise.all([
        marketplaceService.getListings(),
        marketplaceService.getCategories(),
      ]);
      setListings(l);
      setCategories(c.filter((x) => x.is_active));
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMy = useCallback(async () => {
    try { setMyListings(await marketplaceService.getMyListings()); } catch {}
  }, []);

  const loadOrders = useCallback(async (type: "purchases" | "sales") => {
    try { setOrders(await marketplaceService.getOrders(type)); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === "my") loadMy(); }, [tab, loadMy]);
  useEffect(() => { if (tab === "orders") loadOrders(orderTab); }, [tab, orderTab, loadOrders]);

  // Search
  useEffect(() => {
    if (!searchQ.trim()) { load(); return; }
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setListings(await marketplaceService.searchListings(searchQ));
      } catch {} finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQ, load]);

  if (!user) return null;

  // ── Filtered listings ────────────────────────────────────────────────────
  const filtered = catFilter
    ? listings.filter((l) => l.category_slug === catFilter)
    : listings;

  // ── Create listing ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!cf.title) {
      toast({ title: en ? "Title is required" : "Jina linahitajika", variant: "destructive" });
      return;
    }
    if (!cf.price) {
      toast({ title: en ? "Price is required" : "Bei inahitajika", variant: "destructive" });
      return;
    }
    if (cf.category === 0) {
      toast({ 
        title: en ? "Category is required" : "Chagua aina", 
        description: en ? "Please select a category from the dropdown." : "Tafadhali chagua aina ya bidhaa yako.",
        variant: "destructive" 
      });
      return;
    }
    
    setCreating(true);
    try {
      await marketplaceService.createListing({
        ...cf, price: cf.price, quantity: Number(cf.quantity),
        image: cfImage, category: cf.category,
      });
      toast({ title: en ? "Listing created!" : "Bidhaa imeongezwa!" });
      setCreateOpen(false);
      setCf({ title: "", description: "", price: "", quantity: "1", condition: "good", location: "", category: 0 });
      setCfImage(null); setCfPreview("");
      load(); loadMy();
    } catch (e: any) {
      toast({ title: en ? "Failed to create" : "Imeshindwa kuunda", description: e?.response?.data?.message || e.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  // ── Purchase ─────────────────────────────────────────────────────────────
  const handlePurchase = async (item: Listing) => {
    setPurchasing(true);
    try {
      await marketplaceService.purchaseListing(item.listing_code, 1);
      toast({ title: en ? "Purchase successful!" : "Umenunua!" });
      setDetailItem(null);
      load();
      if (tab === "orders") loadOrders(orderTab);
    } catch (e: any) {
      toast({ title: en ? "Purchase failed" : "Imeshindwa", description: e?.response?.data?.message || e.message, variant: "destructive" });
    } finally { setPurchasing(false); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isOwner = (item: Listing) => String(user.id) === getSellerId(item.seller);

  const imgUrl = (item: Listing) =>
    resolveMediaUrl(item.image_url ?? item.image ?? null);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={(user.user_type as "student" | "lecturer") || "student"}
        userName={user.full_name || user.email || "User"}
        onSearch={setSearchQ}
        searchValue={searchQ}
        searchPlaceholder={en ? "Search marketplace…" : "Tafuta sokoni…"}
      />

      <main className="container px-4 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              {en ? "Marketplace" : "Soko"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {en ? "Buy & sell with your campus community" : "Nunua na uza na jamii yako ya chuo"}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full shadow-lg">
            <Plus className="h-4 w-4" /> {en ? "Sell" : "Uza"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-5">
          {([
            { key: "browse" as const, icon: ShoppingBag, label: en ? "Browse" : "Tazama" },
            { key: "my" as const, icon: Package, label: en ? "My Listings" : "Bidhaa Zangu" },
            { key: "orders" as const, icon: Receipt, label: en ? "Orders" : "Oda" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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
                    {c.name} <span className="opacity-60">({c.listing_count})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Listings grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <ShoppingBag className="h-14 w-14 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-semibold text-foreground">{en ? "No listings yet" : "Hakuna bidhaa bado"}</p>
                <p className="text-sm text-muted-foreground mt-1">{en ? "Be the first to sell something!" : "Kuwa wa kwanza kuuza!"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((item) => (
                  <ListingCard key={item.listing_code} item={item} imgUrl={imgUrl(item)} en={en} onClick={() => setDetailItem(item)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── My Listings Tab ───────────────────────────────────────────── */}
        {tab === "my" && (
          myListings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Package className="h-14 w-14 text-muted-foreground/40 mb-4" />
              <p className="font-semibold">{en ? "No listings yet" : "Huna bidhaa bado"}</p>
              <Button onClick={() => setCreateOpen(true)} className="mt-4 gap-2 rounded-full">
                <Plus className="h-4 w-4" /> {en ? "Create Listing" : "Unda Bidhaa"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {myListings.map((item) => (
                <ListingCard key={item.listing_code} item={item} imgUrl={imgUrl(item)} en={en} onClick={() => setDetailItem(item)} showStatus />
              ))}
            </div>
          )
        )}

        {/* ── Orders Tab ────────────────────────────────────────────────── */}
        {tab === "orders" && (
          <>
            <div className="flex gap-2 mb-4">
              <Button
                variant={orderTab === "purchases" ? "default" : "outline"}
                className="rounded-full flex-1"
                onClick={() => setOrderTab("purchases")}
              >
                {en ? "Purchases" : "Manunuzi"}
              </Button>
              <Button
                variant={orderTab === "sales" ? "default" : "outline"}
                className="rounded-full flex-1"
                onClick={() => setOrderTab("sales")}
              >
                {en ? "Sales" : "Mauzo"}
              </Button>
            </div>
            
            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <ShoppingCart className="h-14 w-14 text-muted-foreground/40 mb-4" />
                <p className="font-semibold">
                  {en 
                    ? (orderTab === "purchases" ? "No purchases yet" : "No sales yet") 
                    : (orderTab === "purchases" ? "Hakuna manunuzi bado" : "Hakuna mauzo bado")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <OrderCard key={String(o.id)} order={o} en={en} userId={String(user.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Create Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {en ? "New Listing" : "Bidhaa Mpya"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder={en ? "Title" : "Jina"} value={cf.title} onChange={(e) => setCf({ ...cf, title: e.target.value })} />
            <textarea
              placeholder={en ? "Description" : "Maelezo"}
              className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={cf.description} onChange={(e) => setCf({ ...cf, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder={en ? "Price" : "Bei"} value={cf.price} onChange={(e) => setCf({ ...cf, price: e.target.value })} />
              <Input type="number" placeholder={en ? "Quantity" : "Idadi"} value={cf.quantity} onChange={(e) => setCf({ ...cf, quantity: e.target.value })} min="1" />
            </div>
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={cf.condition} onChange={(e) => setCf({ ...cf, condition: e.target.value as ListingCondition })}
            >
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{en ? c.label : c.sw}</option>)}
            </select>
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={cf.category} onChange={(e) => setCf({ ...cf, category: Number(e.target.value) })}
              disabled={categories.length === 0}
            >
              <option value={0}>
                {categories.length === 0 
                  ? (en ? "No categories available" : "Hakuna aina zilizopo") 
                  : (en ? "Select category" : "Chagua aina")}
              </option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder={en ? "Location (optional)" : "Mahali"} value={cf.location} onChange={(e) => setCf({ ...cf, location: e.target.value })} />
            {/* Image */}
            <label className="flex items-center gap-3 p-3 border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{cfPreview ? cfImage?.name : (en ? "Add photo" : "Ongeza picha")}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setCfImage(f); setCfPreview(URL.createObjectURL(f)); }
              }} />
            </label>
            {cfPreview && <img src={cfPreview} alt="" className="h-32 w-full object-cover rounded-xl" />}
            <Button onClick={handleCreate} disabled={creating} className="w-full rounded-xl h-11">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {en ? "Publish Listing" : "Chapisha"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
          {detailItem && (
            <div>
              {imgUrl(detailItem) ? (
                <img src={imgUrl(detailItem)!} alt={detailItem.title} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-bold text-foreground">{detailItem.title}</h2>
                  <span className="text-xl font-bold text-primary whitespace-nowrap">
                    {Number(detailItem.price).toLocaleString()} TZS
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={conditionColor(detailItem.condition)}>{detailItem.condition.replace("_", " ")}</Badge>
                  {detailItem.category_name && <Badge variant="outline">{detailItem.category_name}</Badge>}
                  {detailItem.status === "sold_out" && <Badge variant="destructive">{en ? "Sold Out" : "Imeisha"}</Badge>}
                </div>
                {detailItem.description && <p className="text-sm text-muted-foreground">{detailItem.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {detailItem.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{detailItem.location}</span>}
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{detailItem.available_quantity} {en ? "left" : "imebaki"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{getSellerName(detailItem.seller)}</span>
                </div>
                {!isOwner(detailItem) && detailItem.status === "active" && detailItem.available_quantity > 0 && (
                  <Button onClick={() => handlePurchase(detailItem)} disabled={purchasing} className="w-full rounded-xl h-11 gap-2">
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {en ? "Buy Now" : "Nunua Sasa"}
                  </Button>
                )}
                {isOwner(detailItem) && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={async () => {
                      try { await marketplaceService.deleteListing(detailItem.listing_code); setDetailItem(null); load(); loadMy(); toast({ title: en ? "Archived" : "Imefutwa" }); } catch {}
                    }}>
                      {en ? "Archive" : "Hifadhi"}
                    </Button>
                  </div>
                )}
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

const ListingCard = ({ item, imgUrl, en, onClick, showStatus }: {
  item: Listing; imgUrl: string | null; en: boolean; onClick: () => void; showStatus?: boolean;
}) => (
  <button
    onClick={onClick}
    className="group bg-background border border-border rounded-2xl overflow-hidden text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer w-full"
  >
    {imgUrl ? (
      <img src={imgUrl} alt={item.title} className="w-full h-32 object-cover group-hover:scale-[1.03] transition-transform" />
    ) : (
      <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
        <ShoppingBag className="h-8 w-8 text-primary/30" />
      </div>
    )}
    <div className="p-3 space-y-1.5">
      <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</p>
      <p className="text-[15px] font-bold text-primary">{Number(item.price).toLocaleString()} TZS</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${conditionColor(item.condition)}`}>
          {item.condition.replace("_", " ")}
        </span>
        {showStatus && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            item.status === "active" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"
          }`}>
            {item.status}
          </span>
        )}
      </div>
      {item.available_quantity === 0 && (
        <p className="text-[10px] font-medium text-destructive">{en ? "Sold out" : "Imeisha"}</p>
      )}
    </div>
  </button>
);

const OrderCard = ({ order, en, userId }: { order: ListingOrder; en: boolean; userId: string }) => {
  const isBuyer = typeof order.buyer === "object" ? String((order.buyer as any).id) === userId : String(order.buyer) === userId;
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-2xl bg-background">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isBuyer ? "bg-primary/10" : "bg-emerald-500/10"}`}>
        {isBuyer ? <ShoppingCart className="h-5 w-5 text-primary" /> : <Store className="h-5 w-5 text-emerald-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {typeof order.listing === "object" ? (order.listing as any).title || `Order #${order.id}` : `Order #${order.id}`}
        </p>
        <p className="text-[12px] text-muted-foreground">
          {isBuyer ? (en ? "Purchased" : "Umenunua") : (en ? "Sold" : "Umeauza")} · {order.quantity}x · {Number(order.total_price).toLocaleString()} TZS
        </p>
      </div>
      <Badge variant={order.status === "completed" ? "default" : "destructive"} className="text-[10px]">
        {order.status}
      </Badge>
    </div>
  );
};

export default Marketplace;
