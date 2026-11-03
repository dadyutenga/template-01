import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Plus,
  Settings2,
  Share2,
} from "lucide-react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import scheduleService, {
  PublicScheduleInfo,
  ScheduleCalendarSummary,
  ScheduleEvent,
  ScheduleEventInput,
  ScheduleShareInfo,
} from "@/services/scheduleService";
import {
  AgendaTabs,
  CalendarCard,
  CalendarCodeEntryForm,
  CalendarSettingsModal,
  EmptyState,
  EventFormApiErrors,
  EventFormSheet,
  PublicSubscriptionCard,
  ScheduleHeader,
  ShareCalendarModal,
  UpcomingEventsList,
} from "./components";
import { calendarTitleForCard, calendarTypeLabel } from "./schedule-utils";

const pageShellClass =
  "min-h-screen bg-background pb-24";

type PendingEventState = {
  calendar: ScheduleCalendarSummary;
  event?: ScheduleEvent;
} | null;

type ApiErrorLike = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

const getApiError = (error: unknown): ApiErrorLike => (typeof error === "object" && error !== null ? (error as ApiErrorLike) : {});

const getErrorStatus = (error: unknown) => getApiError(error).response?.status;

const flattenErrorMessages = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenErrorMessages);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenErrorMessages);
  }
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const data = getApiError(error).response?.data;
  if (!data || typeof data !== "object") return fallback;

  const message = "message" in data && typeof data.message === "string" ? data.message : null;
  if (message) return message;

  const errors = "errors" in data ? flattenErrorMessages(data.errors) : [];
  if (errors.length) return errors[0];

  const fieldErrors = flattenErrorMessages(data);
  return fieldErrors[0] || fallback;
};

const extractFieldErrorMap = (error: unknown): EventFormApiErrors => {
  const data = getApiError(error).response?.data;
  if (!data || typeof data !== "object") return {};

  const pickFirstMessage = (value: unknown): string | null => {
    const flattened = flattenErrorMessages(value);
    return flattened.length ? flattened[0] : null;
  };

  const mapObject = (obj: unknown): EventFormApiErrors => {
    if (!obj || typeof obj !== "object") return {};
    const record = obj as Record<string, unknown>;
    const out: Record<string, string> = {};
    Object.entries(record).forEach(([key, value]) => {
      const msg = pickFirstMessage(value);
      if (msg) out[key] = msg;
    });
    return out as EventFormApiErrors;
  };

  // Wrapped error shape: { success: false, message, errors: { field: [...] } }
  if ("errors" in data) {
    return mapObject((data as any).errors);
  }

  // DRF serializer validation errors (unwrapped): { field: ["msg"] }
  // Ignore clearly non-field keys.
  const mapped = mapObject(data);
  delete (mapped as any).success;
  delete (mapped as any).message;
  delete (mapped as any).data;
  return mapped;
};

const ScheduleHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<ScheduleCalendarSummary[]>([]);
  const [events, setEvents] = useState<Array<ScheduleEvent & { calendar_type?: "classes" | "examination" }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] = useState<ScheduleCalendarSummary | null>(null);
  const [pendingEvent, setPendingEvent] = useState<PendingEventState>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [eventApiErrors, setEventApiErrors] = useState<EventFormApiErrors>({});
  const [shareInfo, setShareInfo] = useState<ScheduleShareInfo | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);

  const userRole = (user?.user_type as "student" | "lecturer") || "student";
  const userName = user?.full_name || user?.email || "Student";

  const loadScheduleHome = useCallback(async () => {
    setIsLoading(true);
    try {
      const calendarList = await scheduleService.listCalendars();
      setCalendars(calendarList);

      const detailResults = await Promise.all(
        calendarList.map(async (calendar) => {
          try {
            const detail = await scheduleService.getCalendar(calendar.id);
            return detail.events.map((event) => ({
              ...event,
              calendar: calendar.id,
              calendar_type: calendar.calendar_type,
            }));
          } catch {
            return [];
          }
        }),
      );

      setEvents(detailResults.flat());
    } catch (error: unknown) {
      toast({
        title: "Could not load schedule",
        description: getErrorMessage(error, "Your planner could not be loaded right now."),
        variant: "destructive",
      });
      setCalendars([]);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScheduleHome();
  }, [loadScheduleHome]);

  useEffect(() => {
    return () => {
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    };
  }, [qrImageUrl]);

  const handleOpenShare = async (calendar: ScheduleCalendarSummary) => {
    setSelectedCalendar(calendar);
    setShareInfo(null);
    setQrImageUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setIsShareLoading(true);

    try {
      const [share, qrBlob] = await Promise.all([
        scheduleService.getShareInfo(calendar.id),
        calendar.is_public_sync ? scheduleService.getCalendarQrBlob(calendar.id) : Promise.resolve(null),
      ]);

      setShareInfo(share);
      if (qrBlob) {
        setQrImageUrl(URL.createObjectURL(qrBlob));
      }
    } catch (error: unknown) {
      setShareInfo(null);
      toast({
        title: "Sharing unavailable",
        description:
          getErrorStatus(error) === 404
            ? "Public sharing is turned off for this calendar."
            : getErrorMessage(error, "We could not prepare the sharing links right now."),
        variant: "destructive",
      });
    } finally {
      setIsShareLoading(false);
      setIsQrLoading(false);
    }
  };

  const saveEvent = async (payload: ScheduleEventInput) => {
    if (!pendingEvent?.calendar) return;
    setIsSubmittingEvent(true);
    setEventApiErrors({});

    try {
      if (pendingEvent.event) {
        await scheduleService.updateEvent(pendingEvent.event.id, payload);
        toast({ title: "Event updated", description: "Your planner has been refreshed." });
      } else {
        await scheduleService.createEvent(pendingEvent.calendar.id, payload);
        toast({ title: "Event added", description: "Your planner has a new item." });
      }

      setPendingEvent(null);
      await loadScheduleHome();
    } catch (error: unknown) {
      const fieldErrors = extractFieldErrorMap(error);
      if (Object.keys(fieldErrors).length) setEventApiErrors(fieldErrors);
      toast({
        title: "Could not save event",
        description: getErrorMessage(error, "We could not save this event. Check the form and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const deleteEvent = async () => {
    if (!pendingEvent?.event) return;
    setIsDeletingEvent(true);
    try {
      await scheduleService.deleteEvent(pendingEvent.event.id);
      toast({ title: "Event removed", description: "The agenda has been updated." });
      setPendingEvent(null);
      await loadScheduleHome();
    } catch (error: unknown) {
      toast({
        title: "Could not delete event",
        description: getErrorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  return (
    <div className={pageShellClass}>
      <DashboardNav userRole={userRole} userName={userName} hideGlobalSearch />

      <main className="container max-w-5xl px-4 py-6 md:py-8">
        <div className="space-y-6">
          <ScheduleHeader
            title="Schedule"
            description="Track your classes, exams, study sessions, and important deadlines."
          />

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-[28px] border border-border bg-card px-5 py-6 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading your academic planner...
            </div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                {calendars.map((calendar) => (
                  <CalendarCard
                    key={calendar.id}
                    calendar={calendar}
                    onOpen={() => navigate(`/schedule/calendar/${calendar.id}`)}
                    onAddEvent={() => setPendingEvent({ calendar })}
                    onShare={() => void handleOpenShare(calendar)}
                  />
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground">Upcoming</h2>
                    <p className="text-sm text-muted-foreground">A calm preview of your next academic moments.</p>
                  </div>
                </div>
                <UpcomingEventsList
                  events={events}
                  emptyAction={
                    calendars[0] ? (
                      <Button variant="hero" className="rounded-2xl" onClick={() => setPendingEvent({ calendar: calendars[0] })}>
                        Add first event
                      </Button>
                    ) : null
                  }
                />
              </section>
            </>
          )}
        </div>
      </main>

      <ShareCalendarModal
        open={Boolean(selectedCalendar)}
        onOpenChange={(open) => !open && setSelectedCalendar(null)}
        calendar={selectedCalendar || undefined}
        shareInfo={shareInfo}
        isLoading={isShareLoading}
        qrImageUrl={qrImageUrl}
        isQrLoading={isQrLoading}
      />

      <EventFormSheet
        open={Boolean(pendingEvent)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingEvent(null);
            setEventApiErrors({});
          }
        }}
        calendarType={pendingEvent?.calendar.calendar_type || "classes"}
        event={pendingEvent?.event}
        isSubmitting={isSubmittingEvent}
        isDeleting={isDeletingEvent}
        onSubmit={saveEvent}
        onDelete={pendingEvent?.event ? deleteEvent : undefined}
        apiErrors={eventApiErrors}
      />

      <BottomNav />
    </div>
  );
};

const ScheduleDetailPage = () => {
  const navigate = useNavigate();
  const { calendarId } = useParams();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<ScheduleCalendarSummary | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEvent, setPendingEvent] = useState<PendingEventState>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [eventApiErrors, setEventApiErrors] = useState<EventFormApiErrors>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareInfo, setShareInfo] = useState<ScheduleShareInfo | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isShareLoading, setIsShareLoading] = useState(false);

  const userRole = (user?.user_type as "student" | "lecturer") || "student";
  const userName = user?.full_name || user?.email || "Student";

  const loadCalendar = useCallback(async () => {
    if (!calendarId) return;
    setIsLoading(true);
    try {
      const detail = await scheduleService.getCalendar(calendarId);
      setCalendar(detail);
      setEvents(detail.events || []);
    } catch (error: unknown) {
      toast({
        title: "Calendar unavailable",
        description:
          getErrorStatus(error) === 404
            ? "This calendar could not be found in your account."
            : getErrorMessage(error, "We could not load this calendar right now."),
        variant: "destructive",
      });
      navigate("/schedule");
    } finally {
      setIsLoading(false);
    }
  }, [calendarId, navigate]);

  const refreshEvents = useCallback(async () => {
    if (!calendarId) return;
    const refreshed = await scheduleService.getCalendarEvents(calendarId);
    setEvents(refreshed);
  }, [calendarId]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    return () => {
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    };
  }, [qrImageUrl]);

  const handleOpenShare = async () => {
    if (!calendar) return;
    setIsShareOpen(true);
    setIsShareLoading(true);

    try {
      const [share, qrBlob] = await Promise.all([
        scheduleService.getShareInfo(calendar.id),
        calendar.is_public_sync ? scheduleService.getCalendarQrBlob(calendar.id) : Promise.resolve(null),
      ]);
      setShareInfo(share);
      setQrImageUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return qrBlob ? URL.createObjectURL(qrBlob) : null;
      });
    } catch (error: unknown) {
      setShareInfo(null);
      toast({
        title: "Sharing unavailable",
        description:
          getErrorStatus(error) === 404
            ? "Public sharing is currently disabled for this calendar."
            : getErrorMessage(error, "We could not load sharing details right now."),
        variant: "destructive",
      });
    } finally {
      setIsShareLoading(false);
    }
  };

  const saveEvent = async (payload: ScheduleEventInput) => {
    if (!calendar || !pendingEvent?.calendar) return;
    setIsSubmittingEvent(true);
    setEventApiErrors({});
    try {
      if (pendingEvent.event) {
        await scheduleService.updateEvent(pendingEvent.event.id, payload);
        toast({ title: "Event updated", description: "The agenda view has been refreshed." });
      } else {
        await scheduleService.createEvent(calendar.id, payload);
        toast({ title: "Event added", description: "Your calendar has a new entry." });
      }

      setPendingEvent(null);
      await refreshEvents();
    } catch (error: unknown) {
      const fieldErrors = extractFieldErrorMap(error);
      if (Object.keys(fieldErrors).length) setEventApiErrors(fieldErrors);
      toast({
        title: "Could not save event",
        description: getErrorMessage(error, "Check the form fields and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const deleteEvent = async () => {
    if (!pendingEvent?.event) return;
    setIsDeletingEvent(true);
    try {
      await scheduleService.deleteEvent(pendingEvent.event.id);
      toast({ title: "Event removed", description: "The agenda has been updated." });
      setPendingEvent(null);
      await refreshEvents();
    } catch (error: unknown) {
      toast({
        title: "Could not delete event",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const saveSettings = async (payload: { name: string; description: string; is_public_sync: boolean }) => {
    if (!calendar) return;
    setIsSavingSettings(true);
    try {
      const updated = await scheduleService.updateCalendar(calendar.id, payload);
      setCalendar(updated);
      toast({ title: "Settings updated", description: "Calendar sharing preferences were saved." });
      setIsSettingsOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Could not save settings",
        description: getErrorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className={pageShellClass}>
      <DashboardNav userRole={userRole} userName={userName} hideGlobalSearch />

      <main className="container max-w-5xl px-4 py-6 md:py-8">
        {isLoading ? (
          <div className="flex items-center gap-3 rounded-[28px] border border-border bg-card px-5 py-6 text-sm text-muted-foreground shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading calendar...
          </div>
        ) : calendar ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Link to="/schedule" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Schedule
              </Link>

              <div className="rounded-[32px] border border-border/70 bg-card px-6 py-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary shadow-none">
                        {calendarTypeLabel(calendar.calendar_type)}
                      </Badge>
                      <Badge
                        className={
                          calendar.is_public_sync
                            ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-none"
                            : "rounded-full border border-border bg-muted text-muted-foreground shadow-none"
                        }
                      >
                        {calendar.is_public_sync ? "Sync enabled" : "Sync disabled"}
                      </Badge>
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
                      {calendarTitleForCard(calendar.calendar_type, calendar.name)}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {calendar.description || "A focused academic calendar for your next classes, exams, and deadlines."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-2xl border-border bg-card" onClick={() => setIsSettingsOpen(true)}>
                      <Settings2 className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="rounded-2xl text-foreground hover:bg-muted" onClick={() => void handleOpenShare()}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="hero" className="rounded-2xl" onClick={() => setPendingEvent({ calendar })}>
                      <Plus className="h-4 w-4" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <AgendaTabs
              events={events}
              calendarType={calendar.calendar_type}
              onEditEvent={(event) => setPendingEvent({ calendar, event })}
              onAddEvent={() => setPendingEvent({ calendar })}
            />
          </div>
        ) : (
          <EmptyState
            title="Calendar not available"
            description="This schedule could not be loaded. Head back to your planner and try another calendar."
            action={
              <Button variant="hero" className="rounded-2xl" onClick={() => navigate("/schedule")}>
                Return to Schedule
              </Button>
            }
          />
        )}
      </main>

      <EventFormSheet
        open={Boolean(pendingEvent)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingEvent(null);
            setEventApiErrors({});
          }
        }}
        calendarType={pendingEvent?.calendar.calendar_type || "classes"}
        event={pendingEvent?.event}
        isSubmitting={isSubmittingEvent}
        isDeleting={isDeletingEvent}
        onSubmit={saveEvent}
        onDelete={pendingEvent?.event ? deleteEvent : undefined}
        apiErrors={eventApiErrors}
      />

      <CalendarSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        calendar={calendar || undefined}
        isSaving={isSavingSettings}
        onSave={saveSettings}
      />

      <ShareCalendarModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        calendar={calendar || undefined}
        shareInfo={shareInfo}
        isLoading={isShareLoading}
        qrImageUrl={qrImageUrl}
      />

      <BottomNav />
    </div>
  );
};

export const SchedulePublicSubscriptionPage = () => {
  const { token, code } = useParams();
  const [info, setInfo] = useState<PublicScheduleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setIsUnavailable(false);
      try {
        const result = token
          ? await scheduleService.getPublicInfoByToken(token)
          : code
            ? await scheduleService.getPublicInfoByCode(code)
            : null;
        setInfo(result);
      } catch {
        setInfo(null);
        setIsUnavailable(true);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [token, code]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container flex min-h-screen max-w-3xl items-center px-4 py-10">
        <div className="mx-auto w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">Kibegi Schedule</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open this calendar in your preferred app, or download the ICS file for manual import.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-[28px] border border-border bg-card px-5 py-8 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Preparing subscription details...
            </div>
          ) : (
            <PublicSubscriptionCard info={info} isUnavailable={isUnavailable} />
          )}

          <div className="text-center">
            <Link to="/schedule/code" className="text-sm font-semibold text-primary hover:text-primary/90">
              Enter Calendar Code
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ScheduleCodeEntryPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    navigate(`/schedule/code/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container flex min-h-screen max-w-2xl items-center px-4 py-10">
        <div className="mx-auto w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Share2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">Enter Calendar Code</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use a short calendar code to open the public subscription page and continue on this device.
            </p>
          </div>
          <CalendarCodeEntryForm code={code} setCode={setCode} onSubmit={() => void handleSubmit()} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
};

const Schedule = () => {
  const { calendarId } = useParams();
  if (calendarId) return <ScheduleDetailPage />;
  return <ScheduleHomePage />;
};

export default Schedule;
