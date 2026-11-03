import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import classService, { ClassData } from "@/services/classService";
import channelService, {
  ChannelProfile,
  ChannelWallet,
  ChannelContact,
  ChannelBroadcast,
} from "@/services/channelService";
import {
  Radio, Users, Megaphone, Settings, Plus, Loader2, Trash2, Copy,
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, Phone,
  UserPlus, Send, CreditCard, ExternalLink, MapPin, Eye, MessageSquare,
  ArrowRight, Link2, Info,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeClasses = (payload: any): ClassData[] => {
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const statusMeta = (s: ChannelBroadcast["status"]) => ({
  sent:    { bg: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  partial: { bg: "bg-amber-500/12 text-amber-700 dark:text-amber-400",      icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  failed:  { bg: "bg-red-500/12 text-red-700 dark:text-red-400",            icon: <XCircle className="h-3.5 w-3.5" /> },
  sending: { bg: "bg-blue-500/12 text-blue-700 dark:text-blue-400",         icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  draft:   { bg: "bg-muted text-muted-foreground",                           icon: <Clock className="h-3.5 w-3.5" /> },
}[s] ?? { bg: "bg-muted text-muted-foreground", icon: <Clock className="h-3.5 w-3.5" /> });

const sourceMeta = (src: ChannelContact["consent_source"]) => ({
  manual:   { label: "Manual",   cls: "border-blue-300/60 text-blue-600 dark:text-blue-400" },
  public:   { label: "Self-reg", cls: "border-emerald-300/60 text-emerald-600 dark:text-emerald-400" },
  imported: { label: "Imported", cls: "border-purple-300/60 text-purple-600 dark:text-purple-400" },
}[src] ?? { label: src, cls: "border-border text-muted-foreground" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const buildSmsPreview = (subject: string, venue: string, message: string) => {
  const parts = ["Kibegi class update"];
  if (subject.trim()) parts.push(subject.trim());
  if (venue.trim()) parts.push(`Venue: ${venue.trim()}`);
  if (message.trim()) parts.push(message.trim());
  return parts.join(" | ");
};

// ── Main component ─────────────────────────────────────────────────────────────

const Channel = () => {
  const { user } = useAuth();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classLoading, setClassLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classPickerOpen, setClassPickerOpen] = useState(false);

  const [profile, setProfile] = useState<ChannelProfile | null>(null);
  const [wallet, setWallet] = useState<ChannelWallet | null>(null);
  const [contacts, setContacts] = useState<ChannelContact[]>([]);
  const [broadcasts, setBroadcasts] = useState<ChannelBroadcast[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [tab, setTab] = useState<"contacts" | "broadcasts" | "settings">("contacts");

  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({ full_name: "", phone_number: "", notes: "" });
  const [addingContact, setAddingContact] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ subject: "", message: "", venue: "" });
  const [sending, setSending] = useState(false);
  const smsPreview = useMemo(
    () => buildSmsPreview(newBroadcast.subject, newBroadcast.venue, newBroadcast.message),
    [newBroadcast]
  );

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Partial<ChannelProfile>>({});

  useEffect(() => {
    classService.listClasses()
      .then((res) => setClasses(normalizeClasses(res)))
      .catch(() => setClasses([]))
      .finally(() => setClassLoading(false));
  }, []);

  const loadChannelData = useCallback(async (cls: ClassData) => {
    setDataLoading(true);
    setAccessDenied(false);
    setProfile(null); setWallet(null); setContacts([]); setBroadcasts([]);
    try {
      const [prof, wal, ctcts, bcs] = await Promise.all([
        channelService.getProfile(cls.id),
        channelService.getWallet(cls.id),
        channelService.getContacts(cls.id),
        channelService.getBroadcasts(cls.id),
      ]);
      setProfile(prof);
      setWallet(wal);
      setContacts(ctcts.results);
      setBroadcasts(bcs.results);
      setSettingsDraft({
        public_registration_enabled: prof.public_registration_enabled,
        default_sender_name: prof.default_sender_name,
        registration_hint: prof.registration_hint,
      });
    } catch (e: any) {
      if (e?.response?.status === 403) setAccessDenied(true);
      else toast({ title: "Failed to load channel data", variant: "destructive" });
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleSelectClass = (cls: ClassData) => {
    setSelectedClass(cls);
    setClassPickerOpen(false);
    setTab("contacts");
    loadChannelData(cls);
  };

  const handleAddContact = async () => {
    if (!selectedClass) return;
    if (!newContact.full_name.trim() || !newContact.phone_number.trim()) {
      toast({ title: "Name and phone number are required", variant: "destructive" });
      return;
    }
    setAddingContact(true);
    try {
      const contact = await channelService.addContact(selectedClass.id, {
        full_name: newContact.full_name.trim(),
        phone_number: newContact.phone_number.trim(),
        notes: newContact.notes.trim(),
        consent_granted: true,
      });
      setContacts(prev => {
        const idx = prev.findIndex(c => c.id === contact.id);
        return idx >= 0 ? prev.map(c => c.id === contact.id ? contact : c) : [contact, ...prev];
      });
      if (profile) setProfile({ ...profile, contact_count: profile.contact_count + 1 });
      setAddContactOpen(false);
      setNewContact({ full_name: "", phone_number: "", notes: "" });
      toast({ title: "Contact added" });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error?.message || e.message;
      toast({ title: "Failed to add contact", description: msg, variant: "destructive" });
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Remove this contact?")) return;
    try {
      await channelService.deleteContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      if (profile) setProfile({ ...profile, contact_count: Math.max(0, profile.contact_count - 1) });
      toast({ title: "Contact removed" });
    } catch {
      toast({ title: "Failed to remove contact", variant: "destructive" });
    }
  };

  const handleSendBroadcast = async () => {
    if (!selectedClass) return;
    if (!newBroadcast.message.trim()) {
      toast({ title: "Message is required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const bc = await channelService.sendBroadcast(selectedClass.id, {
        subject: newBroadcast.subject.trim() || undefined,
        message: newBroadcast.message.trim(),
        venue: newBroadcast.venue.trim() || undefined,
      });
      setBroadcasts(prev => [bc, ...prev]);
      channelService.getWallet(selectedClass.id).then(setWallet).catch(() => {});
      setComposeOpen(false);
      setNewBroadcast({ subject: "", message: "", venue: "" });
      toast({ title: `Broadcast ${bc.sent_count > 0 ? `sent to ${bc.sent_count}` : bc.status}!` });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error?.message || e.message;
      toast({ title: "Failed to send broadcast", description: msg, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedClass) return;
    setSavingSettings(true);
    try {
      const updated = await channelService.updateProfile(selectedClass.id, settingsDraft);
      setProfile(updated);
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const regUrl = profile?.registration_urls?.public_token
    ? `${window.location.origin}/channel/register/${profile.registration_urls.public_token}`
    : null;

  const handleCopyLink = () => {
    if (!regUrl) return;
    navigator.clipboard.writeText(regUrl).then(() => toast({ title: "Registration link copied!" }));
  };

  if (!user) return null;

  const creditLevel = wallet
    ? wallet.balance_credits === 0 ? "empty" : wallet.balance_credits < 10 ? "low" : "ok"
    : "ok";

  const creditColor = { empty: "text-red-600 dark:text-red-400", low: "text-amber-600 dark:text-amber-400", ok: "text-emerald-600 dark:text-emerald-400" }[creditLevel];
  const creditBg    = { empty: "bg-red-500/8 border-red-300/40", low: "bg-amber-500/8 border-amber-300/40", ok: "bg-emerald-500/8 border-emerald-300/40" }[creditLevel];

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav
        userRole={(user.user_type as "student" | "lecturer") || "student"}
        userName={user.full_name || user.email || "User"}
      />

      <main className="container px-4 py-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            Channel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collect contacts · Top up credits · Broadcast SMS to your class
          </p>
        </div>

        {/* Class picker */}
        <div className="relative mb-6">
          <button
            onClick={() => setClassPickerOpen(!classPickerOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              {classLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : selectedClass ? (
                <div>
                  <p className="text-[15px] font-semibold text-foreground leading-tight">{selectedClass.name}</p>
                  <p className="text-[12px] text-muted-foreground">{selectedClass.class_code}</p>
                </div>
              ) : (
                <span className="text-[15px] font-medium text-muted-foreground">Select a class to manage</span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${classPickerOpen ? "rotate-180" : ""}`} />
          </button>

          {classPickerOpen && (
            <div className="absolute top-full mt-1 w-full z-20 bg-background border border-border rounded-2xl shadow-lg overflow-hidden">
              {!classLoading && classes.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-5 text-center">
                  No classes found. Join or create a class first.
                </p>
              ) : classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/40 last:border-0"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground leading-tight">{cls.name}</p>
                    <p className="text-[11px] text-muted-foreground">{cls.class_code}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* No class selected */}
        {!selectedClass && !classLoading && (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Radio className="h-7 w-7 text-primary" />
            </div>
            <p className="text-[17px] font-bold text-foreground">Select a class to get started</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
              Choose a class above to manage its SMS channel — collect contacts, send announcements, and track delivery.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                { step: "1", icon: UserPlus, title: "Collect contacts", body: "Add manually or share a self-registration link" },
                { step: "2", icon: CreditCard, title: "Top up credits",  body: "Each SMS costs 1 credit. Top up via wallet settings." },
                { step: "3", icon: Megaphone, title: "Broadcast",        body: "Send subject + venue + message to all contacts at once" },
              ].map(({ step, icon: Icon, title, body }) => (
                <div key={step} className="flex gap-3 p-3.5 bg-muted/40 rounded-2xl">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[12px] font-bold text-primary">{step}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedClass && dataLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {selectedClass && !dataLoading && accessDenied && (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-[17px] font-bold text-foreground">Access denied</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              Only lecturers and class representatives can manage this channel. Ask your lecturer to promote you.
            </p>
          </div>
        )}

        {/* Channel dashboard */}
        {selectedClass && !dataLoading && !accessDenied && profile && wallet && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                onClick={() => setTab("contacts")}
                className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all text-left ${tab === "contacts" ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}
              >
                <div className="flex items-center justify-between">
                  <Users className="h-4 w-4 text-primary" />
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none">{contacts.length}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Contacts</p>
              </button>

              <div className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border ${creditBg}`}>
                <div className="flex items-center justify-between">
                  <CreditCard className={`h-4 w-4 ${creditColor}`} />
                  {!wallet.is_active && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                </div>
                <p className={`text-2xl font-bold leading-none ${creditColor}`}>{wallet.balance_credits}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {creditLevel === "empty" ? "No credits!" : creditLevel === "low" ? "Low credits" : "SMS credits"}
                </p>
              </div>

              <button
                onClick={() => setTab("broadcasts")}
                className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all text-left ${tab === "broadcasts" ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}
              >
                <div className="flex items-center justify-between">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none">{broadcasts.length}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Broadcasts</p>
              </button>
            </div>

            {!wallet.is_active && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-destructive/8 border border-destructive/20 mb-4">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-foreground">SMS wallet is inactive</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    All broadcasts will be skipped until the wallet is reactivated. Contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Quick-action bar */}
            <div className="flex gap-2 mb-5">
              <Button
                className="flex-1 rounded-xl h-10 gap-2 text-[13px]"
                onClick={() => { setTab("broadcasts"); setComposeOpen(true); }}
                disabled={contacts.length === 0 || !wallet.is_active}
              >
                <Megaphone className="h-4 w-4" /> Broadcast
              </Button>
              {profile.public_registration_enabled && regUrl && (
                <Button variant="outline" className="flex-1 rounded-xl h-10 gap-2 text-[13px]" onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4" /> Copy reg. link
                </Button>
              )}
              <button
                onClick={() => setTab("settings")}
                className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${tab === "settings" ? "border-primary/40 bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-5">
              {([
                { key: "contacts"   as const, icon: Users,    label: "Contacts" },
                { key: "broadcasts" as const, icon: Megaphone, label: "Broadcasts" },
                { key: "settings"   as const, icon: Settings,  label: "Settings" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all border-none cursor-pointer ${
                    tab === t.key ? "bg-background text-foreground shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {tab === "contacts" && (
              <ContactsTab
                contacts={contacts} profile={profile} regUrl={regUrl}
                onAddContact={() => setAddContactOpen(true)}
                onDeleteContact={handleDeleteContact}
                onCopyLink={handleCopyLink}
              />
            )}
            {tab === "broadcasts" && (
              <BroadcastsTab broadcasts={broadcasts} contacts={contacts} wallet={wallet} onCompose={() => setComposeOpen(true)} />
            )}
            {tab === "settings" && (
              <SettingsTab
                draft={settingsDraft} profile={profile} wallet={wallet} regUrl={regUrl}
                saving={savingSettings}
                onChange={setSettingsDraft}
                onSave={handleSaveSettings}
                onCopyLink={handleCopyLink}
              />
            )}
          </>
        )}
      </main>

      {/* Add contact dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Add Contact
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input placeholder="Full name" value={newContact.full_name}
              onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })} className="rounded-xl" />
            <Input placeholder="+255712345678" value={newContact.phone_number} type="tel"
              onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })} className="rounded-xl" />
            <textarea
              placeholder="Notes (optional)"
              className="w-full min-h-[68px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={newContact.notes}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
            />
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/50 text-[12px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Consent is implied for manually-added contacts.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAddContactOpen(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl" onClick={handleAddContact} disabled={addingContact}>
                {addingContact ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Broadcast compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> New Broadcast
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input placeholder="Subject (optional) — e.g. CAT Postponed"
              value={newBroadcast.subject}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, subject: e.target.value })}
              className="rounded-xl" />
            <textarea
              placeholder="Message *"
              className="w-full min-h-[100px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={newBroadcast.message}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Venue (optional) — e.g. Block B Room 12"
                value={newBroadcast.venue}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, venue: e.target.value })}
                className="rounded-xl pl-9" />
            </div>

            {/* SMS preview */}
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">SMS preview</p>
              </div>
              <p className="text-[13px] text-foreground font-mono leading-relaxed break-all">{smsPreview}</p>
              <p className="text-[11px] text-muted-foreground">
                {smsPreview.length} characters · ~{Math.ceil(smsPreview.length / 160)} SMS unit{smsPreview.length > 160 ? "s" : ""}
              </p>
            </div>

            {contacts.length > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
                <CreditCard className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[13px] text-foreground">
                  {contacts.length} recipient{contacts.length !== 1 ? "s" : ""} · <span className="font-semibold">{contacts.length} credit{contacts.length !== 1 ? "s" : ""}</span> will be used
                </p>
              </div>
            )}

            {sending && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-300/30">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                <p className="text-[13px] text-blue-700 dark:text-blue-400">
                  Sending — this may take a moment for large contact lists…
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setComposeOpen(false)} disabled={sending}>Cancel</Button>
              <Button className="flex-1 rounded-xl" onClick={handleSendBroadcast} disabled={sending || !newBroadcast.message.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Send now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

// ── Contacts Tab ──────────────────────────────────────────────────────────────

const ContactsTab = ({ contacts, profile, regUrl, onAddContact, onDeleteContact, onCopyLink }: {
  contacts: ChannelContact[];
  profile: ChannelProfile;
  regUrl: string | null;
  onAddContact: () => void;
  onDeleteContact: (id: string) => void;
  onCopyLink: () => void;
}) => {
  const publicCount   = contacts.filter(c => c.consent_source === "public").length;
  const manualCount   = contacts.filter(c => c.consent_source === "manual").length;
  const importedCount = contacts.filter(c => c.consent_source === "imported").length;

  return (
    <div>
      {contacts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {manualCount   > 0 && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">{manualCount} manual</span>}
          {publicCount   > 0 && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{publicCount} self-reg</span>}
          {importedCount > 0 && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">{importedCount} imported</span>}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          {profile.public_registration_enabled && regUrl && (
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-[13px] h-8" onClick={onCopyLink}>
              <Copy className="h-3.5 w-3.5" /> Share link
            </Button>
          )}
          <Button size="sm" className="rounded-xl gap-1.5 text-[13px] h-8" onClick={onAddContact}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 px-5 py-10 text-center space-y-4">
          <Phone className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <div>
            <p className="text-[15px] font-semibold text-foreground">No contacts yet</p>
            <p className="text-sm text-muted-foreground mt-1">There are two ways to add contacts:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mt-2">
            <div className="p-3.5 bg-muted/40 rounded-2xl space-y-1">
              <p className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-primary" /> Add manually
              </p>
              <p className="text-[12px] text-muted-foreground">Type in the name and phone number yourself.</p>
              <Button size="sm" className="rounded-xl mt-2 w-full h-8 text-[12px]" onClick={onAddContact}>Add contact</Button>
            </div>
            <div className="p-3.5 bg-muted/40 rounded-2xl space-y-1">
              <p className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                <Link2 className="h-4 w-4 text-emerald-500" /> Self-registration
              </p>
              <p className="text-[12px] text-muted-foreground">Share a link and let students register themselves.</p>
              {profile.public_registration_enabled && regUrl ? (
                <Button size="sm" variant="outline" className="rounded-xl mt-2 w-full h-8 text-[12px]" onClick={onCopyLink}>
                  <Copy className="h-3 w-3 mr-1.5" /> Copy link
                </Button>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1 italic">Enable in Settings → Public Registration</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const src = sourceMeta(c.consent_source);
            return (
              <div key={c.id} className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-2xl hover:border-primary/20 transition-colors">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-primary">{c.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-foreground leading-tight truncate">{c.full_name}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${src.cls}`}>{src.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-[12px] text-muted-foreground font-mono">{c.phone_number}</p>
                    {c.notes && <p className="text-[11px] text-muted-foreground italic truncate max-w-[160px]">{c.notes}</p>}
                  </div>
                  {c.added_by_name && c.consent_source === "manual" && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">by {c.added_by_name}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteContact(c.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Broadcasts Tab ────────────────────────────────────────────────────────────

const BroadcastsTab = ({ broadcasts, contacts, wallet, onCompose }: {
  broadcasts: ChannelBroadcast[];
  contacts: ChannelContact[];
  wallet: ChannelWallet;
  onCompose: () => void;
}) => {
  const canBroadcast = contacts.length > 0 && wallet.is_active;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-muted-foreground">{broadcasts.length} broadcast{broadcasts.length !== 1 ? "s" : ""}</p>
        <Button size="sm" className="rounded-xl gap-1.5 text-[13px] h-8" onClick={onCompose} disabled={!canBroadcast}>
          <Megaphone className="h-3.5 w-3.5" /> New Broadcast
        </Button>
      </div>

      {contacts.length === 0 && (
        <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-amber-500/8 border border-amber-300/40 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">No contacts yet</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Add contacts in the Contacts tab first.</p>
          </div>
        </div>
      )}
      {!wallet.is_active && (
        <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-red-500/8 border border-red-300/40 mb-4">
          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-foreground">Wallet inactive — reactivate in Settings to broadcast.</p>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 px-5 py-12 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-foreground">No broadcasts yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Send your first announcement — subject, message, and optional venue are combined into a single SMS.
          </p>
          {canBroadcast && (
            <Button className="mt-5 rounded-xl gap-2" onClick={onCompose}>
              <Megaphone className="h-4 w-4" /> Send first broadcast
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((bc) => {
            const meta = statusMeta(bc.status);
            const total = bc.recipient_count || (bc.sent_count + bc.failed_count + bc.skipped_count);
            const sentPct = total > 0 ? Math.round((bc.sent_count / total) * 100) : 0;
            const failPct = total > 0 ? Math.round((bc.failed_count / total) * 100) : 0;

            return (
              <div key={bc.id} className="p-4 bg-card border border-border rounded-2xl space-y-3 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {bc.subject && <p className="text-[14px] font-bold text-foreground leading-tight truncate">{bc.subject}</p>}
                    <p className={`text-[13px] text-foreground/80 line-clamp-2 ${bc.subject ? "mt-0.5" : ""}`}>{bc.message}</p>
                    {bc.venue && (
                      <p className="flex items-center gap-1 text-[12px] text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" /> {bc.venue}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.bg}`}>
                    {meta.icon} {bc.status}
                  </span>
                </div>

                {total > 0 && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                      {sentPct > 0 && <div className="h-full bg-emerald-500 transition-all" style={{ width: `${sentPct}%` }} />}
                      {failPct > 0 && <div className="h-full bg-red-400 transition-all" style={{ width: `${failPct}%` }} />}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{bc.sent_count}/{total} sent</span>
                      {bc.failed_count > 0 && <span className="text-[11px] text-red-500 font-medium">{bc.failed_count} failed</span>}
                      {bc.skipped_count > 0 && <span className="text-[11px] text-muted-foreground">{bc.skipped_count} skipped</span>}
                      {bc.credits_used > 0 && <span className="text-[11px] text-muted-foreground">· {bc.credits_used} credits used</span>}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
                  <Clock className="h-3 w-3" />
                  {fmtDate(bc.created_at)} at {fmtTime(bc.created_at)}
                  {bc.sender_name && <><span className="mx-1">·</span><span>by {bc.sender_name}</span></>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Settings Tab ──────────────────────────────────────────────────────────────

const SettingsTab = ({ draft, profile, wallet, regUrl, saving, onChange, onSave, onCopyLink }: {
  draft: Partial<ChannelProfile>;
  profile: ChannelProfile;
  wallet: ChannelWallet;
  regUrl: string | null;
  saving: boolean;
  onChange: (d: Partial<ChannelProfile>) => void;
  onSave: () => void;
  onCopyLink: () => void;
}) => (
  <div className="space-y-5">
    {/* Wallet */}
    <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
      <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" /> SMS Wallet
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{wallet.balance_credits}</p>
          <p className="text-[12px] text-muted-foreground">credits remaining</p>
        </div>
        <div className="text-right">
          <p className={`text-[12px] font-semibold ${wallet.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
            {wallet.is_active ? "Active" : "Inactive"}
          </p>
          {wallet.sender_id && <p className="text-[11px] text-muted-foreground mt-0.5">ID: {wallet.sender_id}</p>}
        </div>
      </div>
      <p className="text-[12px] text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
        To top up credits or reactivate the wallet, contact your Kibegi administrator.
      </p>
    </div>

    {/* Registration link */}
    {regUrl && (
      <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-500" /> Registration Link
          </p>
          <div className="flex gap-1">
            <button onClick={onCopyLink} className="h-8 w-8 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors">
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <a href={regUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>
        <p className="text-[12px] font-mono text-muted-foreground truncate bg-muted/50 rounded-xl px-3 py-2">{regUrl}</p>
        <Button variant="outline" className="w-full rounded-xl h-9 gap-2 text-[13px]" onClick={onCopyLink}>
          <Copy className="h-4 w-4" /> Copy & share with students
        </Button>
      </div>
    )}

    {/* Public registration toggle */}
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
      <div className="flex-1 mr-4">
        <p className="text-[14px] font-semibold text-foreground">Public Registration</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">Allow students to self-register via the link above</p>
      </div>
      <Switch
        checked={draft.public_registration_enabled ?? profile.public_registration_enabled}
        onCheckedChange={(v) => onChange({ ...draft, public_registration_enabled: v })}
      />
    </div>

    {/* Sender name */}
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold text-foreground px-1">Default Sender Name</label>
      <Input
        placeholder="e.g. Math Department"
        value={draft.default_sender_name ?? profile.default_sender_name}
        onChange={(e) => onChange({ ...draft, default_sender_name: e.target.value })}
        className="rounded-xl"
      />
      <p className="text-[11px] text-muted-foreground px-1">Appears as sender ID in SMS messages (if supported by provider)</p>
    </div>

    {/* Registration hint */}
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold text-foreground px-1">Registration Page Hint</label>
      <textarea
        className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="e.g. Register to receive class updates and exam reminders."
        value={draft.registration_hint ?? profile.registration_hint}
        onChange={(e) => onChange({ ...draft, registration_hint: e.target.value })}
      />
      <p className="text-[11px] text-muted-foreground px-1">Shown on the public self-registration page.</p>
    </div>

    {/* SMS format reference */}
    <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
      <p className="text-[12px] font-semibold text-muted-foreground flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5" /> SMS message format
      </p>
      <p className="text-[12px] text-foreground font-mono leading-relaxed">
        Kibegi class update | <em className="text-muted-foreground">subject</em> | Venue: <em className="text-muted-foreground">venue</em> | <em className="text-muted-foreground">message</em>
      </p>
      <p className="text-[11px] text-muted-foreground">Subject and venue are optional — only included if provided.</p>
    </div>

    <Button className="w-full rounded-xl h-11" onClick={onSave} disabled={saving}>
      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Save Settings
    </Button>
  </div>
);

export default Channel;
