import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  QrCode,
  RefreshCcw,
  Repeat,
  Settings2,
  Share2,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarType,
  PublicScheduleInfo,
  ScheduleCalendarSummary,
  ScheduleEvent,
  ScheduleEventInput,
  ScheduleEventType,
  ScheduleRecurrence,
  ScheduleShareInfo,
  WeekdayName,
} from "@/services/scheduleService";
import {
  calendarAccentClasses,
  calendarTitleForCard,
  calendarTypeLabel,
  eventTypeLabel,
  eventTypeOptions,
  eventTypeTone,
  formatEventTimeRange,
  getMonthMatrix,
  getWeekEvents,
  groupEventsByDate,
  groupUpcomingEvents,
  recurrenceLabel,
  recurrenceOptions,
  reminderOptions,
  toLocalDateTimeInputValue,
  weekdayOptions,
  weekdaySummary,
} from "./schedule-utils";

type EventFormValues = {
  title: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  event_type: ScheduleEventType;
  recurrence: ScheduleRecurrence;
  days: WeekdayName[];
  reminder_minutes: string;
};

export type EventFormApiErrors = Partial<
  Record<
    | "title"
    | "description"
    | "location"
    | "start_at"
    | "end_at"
    | "event_type"
    | "recurrence"
    | "days"
    | "reminder_minutes",
    string
  >
>;

type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export const ScheduleHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
  icon: Icon = CalendarDays,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: typeof CalendarDays;
}) => (
  <div className="rounded-[28px] border border-dashed border-border bg-card/75 px-6 py-10 text-center shadow-sm">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);

export const CalendarCard = ({
  calendar,
  onOpen,
  onAddEvent,
  onShare,
}: {
  calendar: ScheduleCalendarSummary;
  onOpen: () => void;
  onAddEvent: () => void;
  onShare: () => void;
}) => (
  <Card className={cn("overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-sm",)}>
    <CardHeader className={cn("gap-4 bg-gradient-to-br px-5 pb-4 pt-5", calendarAccentClasses(calendar.calendar_type))}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge className="rounded-full border border-border/70 bg-card/90 text-[11px] font-semibold text-foreground shadow-none">
            {calendarTypeLabel(calendar.calendar_type)}
          </Badge>
          <CardTitle className="mt-3 text-xl font-black tracking-tight text-foreground">
            {calendarTitleForCard(calendar.calendar_type, calendar.name)}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {calendar.description || "Keep your core academic schedule organized in one calm, focused place."}
          </CardDescription>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/90 px-3 py-2 text-right shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Events</p>
          <p className="mt-1 text-2xl font-black text-foreground">{calendar.event_count}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 px-5 pb-5 pt-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Public subscription</p>
          <p className="text-xs text-muted-foreground">
            {calendar.is_public_sync ? "Enabled for ICS sharing" : "Turn on sharing to generate an ICS feed"}
          </p>
        </div>
        <Badge
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-none",
            calendar.is_public_sync
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {calendar.is_public_sync ? "Enabled" : "Off"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="rounded-2xl border-border bg-card" onClick={onOpen}>
          Open
        </Button>
        <Button variant="hero" className="rounded-2xl" onClick={onAddEvent}>
          Add Event
        </Button>
        <Button variant="ghost" className="rounded-2xl text-foreground hover:bg-muted" onClick={onShare}>
          Share
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const UpcomingEventsList = ({
  events,
  emptyAction,
}: {
  events: Array<ScheduleEvent & { calendar_type?: CalendarType }>;
  emptyAction?: ReactNode;
}) => {
  const groups = useMemo(() => groupUpcomingEvents(events), [events]);

  if (!groups.length) {
    return (
      <EmptyState
        title="No upcoming events yet"
        description="Your next classes, exams, and deadlines will show up here once you add them."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="rounded-[24px] border border-border bg-card/85 shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</h3>
          </div>
          <div className="divide-y divide-border/60">
            {group.events.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{event.title}</p>
                    <Badge className="rounded-full border border-border bg-background text-[11px] font-semibold text-muted-foreground shadow-none">
                      {calendarTypeLabel(event.calendar_type)}
                    </Badge>
                    <Badge className={cn("rounded-full border text-[11px] font-semibold shadow-none", eventTypeTone(event.event_type))}>
                      {eventTypeLabel(event.event_type)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(parseISO(event.start_at), "EEE, h:mm a")}
                    </span>
                    {event.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  to={event.calendar ? `/schedule/calendar/${event.calendar}` : "/schedule"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const EventCard = ({
  event,
  onEdit,
  showCalendarType = false,
  calendarType,
}: {
  event: ScheduleEvent;
  onEdit?: () => void;
  showCalendarType?: boolean;
  calendarType?: CalendarType;
}) => (
  <button
    type="button"
    onClick={onEdit}
    className="w-full rounded-[24px] border border-border bg-card px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-bold text-foreground">{event.title}</p>
          <Badge className={cn("rounded-full border text-[11px] font-semibold shadow-none", eventTypeTone(event.event_type))}>
            {eventTypeLabel(event.event_type)}
          </Badge>
          {showCalendarType && calendarType ? (
            <Badge className="rounded-full border border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground shadow-none">
              {calendarTypeLabel(calendarType)}
            </Badge>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {formatEventTimeRange(event)}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          ) : null}
          {event.reminder_minutes ? (
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {event.reminder_minutes} min reminder
            </span>
          ) : null}
          {event.recurrence !== "none" ? (
            <span className="inline-flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5" />
              {recurrenceLabel(event.recurrence)}
              {event.recurrence === "weekly" && weekdaySummary(event.days) ? ` · ${weekdaySummary(event.days)}` : ""}
            </span>
          ) : null}
        </div>
        {event.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{event.description}</p> : null}
      </div>
      {onEdit ? (
        <div className="rounded-xl border border-border bg-muted/40 p-2 text-muted-foreground">
          <Pencil className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  </button>
);

export const DateGroup = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <section className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="h-px flex-1 bg-border" />
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const buildEventFormValues = (
  calendarType: CalendarType,
  event?: ScheduleEvent,
): EventFormValues => {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: event?.title || "",
    description: event?.description || "",
    location: event?.location || "",
    start_at: event?.start_at ? toLocalDateTimeInputValue(event.start_at) : toLocalDateTimeInputValue(now.toISOString()),
    end_at: event?.end_at ? toLocalDateTimeInputValue(event.end_at) : toLocalDateTimeInputValue(later.toISOString()),
    event_type: event?.event_type || (calendarType === "examination" ? "exam" : "class"),
    recurrence: event?.recurrence || "none",
    days: event?.days || [],
    reminder_minutes: event?.reminder_minutes ? String(event.reminder_minutes) : "",
  };
};

const validateEventForm = (values: EventFormValues) => {
  const errors: EventFormErrors = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.start_at) errors.start_at = "Start date and time is required.";
  if (!values.end_at) errors.end_at = "End date and time is required.";

  if (values.start_at && values.end_at) {
    const start = parseDateTimeLocal(values.start_at);
    const end = parseDateTimeLocal(values.end_at);
    if (Number.isNaN(start.getTime())) errors.start_at = "Enter a valid start date and time.";
    if (Number.isNaN(end.getTime())) errors.end_at = "Enter a valid end date and time.";
    if (!errors.start_at && !errors.end_at && end <= start) {
      errors.end_at = "End time must be after the start time.";
    }
  }

  if (values.recurrence === "weekly" && values.days.length === 0) {
    errors.days = "Choose at least one weekday for weekly recurrence.";
  }

  return errors;
};

// `datetime-local` values come in as `YYYY-MM-DDTHH:mm`.
// Parse them explicitly as local time to avoid browser inconsistencies.
const parseDateTimeLocal = (value: string) => {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return new Date("invalid");

  const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
  const [hourRaw, minuteRaw] = timePart.split(":");

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return new Date("invalid");
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const toIsoFromDateTimeLocal = (value: string) => parseDateTimeLocal(value).toISOString();

const normalizeEventPayload = (values: EventFormValues): ScheduleEventInput => ({
  title: values.title.trim(),
  description: values.description.trim() || undefined,
  location: values.location.trim() || undefined,
  start_at: toIsoFromDateTimeLocal(values.start_at),
  end_at: toIsoFromDateTimeLocal(values.end_at),
  event_type: values.event_type,
  recurrence: values.recurrence,
  days: values.recurrence === "weekly" ? values.days : undefined,
  reminder_minutes: values.reminder_minutes ? Number(values.reminder_minutes) : undefined,
});

const ResponsiveModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn("max-h-[92vh] rounded-t-[28px] border-border bg-card px-0", className)}>
          <DrawerHeader className="px-5 pb-2 text-left">
            <DrawerTitle className="text-xl font-black tracking-tight text-foreground">{title}</DrawerTitle>
            {description ? <DrawerDescription className="text-sm leading-6 text-muted-foreground">{description}</DrawerDescription> : null}
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-5">{children}</div>
          {footer ? <DrawerFooter className="border-t border-border bg-card/95 px-5 py-4">{footer}</DrawerFooter> : null}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl rounded-[28px] border-border bg-card p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]", className)}>
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6 text-left">
          <DialogTitle className="text-xl font-black tracking-tight text-foreground">{title}</DialogTitle>
          {description ? <DialogDescription className="text-sm leading-6 text-muted-foreground">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <DialogFooter className="border-t border-border px-6 py-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
};

export const EventFormSheet = ({
  open,
  onOpenChange,
  calendarType,
  event,
  isSubmitting,
  isDeleting,
  onSubmit,
  onDelete,
  apiErrors,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarType: CalendarType;
  event?: ScheduleEvent;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onSubmit: (payload: ScheduleEventInput) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  apiErrors?: EventFormApiErrors;
}) => {
  const [values, setValues] = useState<EventFormValues>(buildEventFormValues(calendarType, event));
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [apiFieldErrors, setApiFieldErrors] = useState<EventFormApiErrors>({});

  useEffect(() => {
    if (open) {
      setValues(buildEventFormValues(calendarType, event));
      setErrors({});
      setApiFieldErrors(apiErrors || {});
    }
  }, [apiErrors, calendarType, event, open]);

  const clearApiFieldError = (field: keyof EventFormApiErrors) => {
    setApiFieldErrors((current) => {
      if (!current?.[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const isEdit = Boolean(event);

  const footer = (
    <>
      {isEdit && onDelete ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          onClick={() => void onDelete()}
          disabled={isSubmitting || isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl border-border bg-card sm:w-auto"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting || isDeleting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="hero"
        className="w-full rounded-2xl sm:w-auto"
        disabled={isSubmitting || isDeleting}
        onClick={async () => {
          const validation = validateEventForm(values);
          setErrors(validation);
          if (Object.keys(validation).length > 0) return;
          await onSubmit(normalizeEventPayload(values));
        }}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {isEdit ? "Save changes" : "Create event"}
      </Button>
    </>
  );

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit event" : "Add event"}
      description={
        calendarType === "examination"
          ? "Plan exams, deadlines, and revision blocks without losing the calm overview."
          : "Add classes, study sessions, and important schedule moments to your planner."
      }
      footer={footer}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="event-title">Title</Label>
          <Input
            id="event-title"
            value={values.title}
            onChange={(event) => {
              clearApiFieldError("title");
              setValues((current) => ({ ...current, title: event.target.value }));
            }}
            className="rounded-2xl border-border bg-muted/40"
            placeholder={calendarType === "examination" ? "Applied Statistics exam" : "Linear Algebra"}
          />
          {errors.title || apiFieldErrors.title ? (
            <p className="text-xs font-medium text-rose-600">{errors.title || apiFieldErrors.title}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-start">Start</Label>
            <Input
              id="event-start"
              type="datetime-local"
              value={values.start_at}
              onChange={(event) => {
                clearApiFieldError("start_at");
                setValues((current) => ({ ...current, start_at: event.target.value }));
              }}
              className="rounded-2xl border-border bg-muted/40"
            />
            {errors.start_at || apiFieldErrors.start_at ? (
              <p className="text-xs font-medium text-rose-600">{errors.start_at || apiFieldErrors.start_at}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-end">End</Label>
            <Input
              id="event-end"
              type="datetime-local"
              value={values.end_at}
              onChange={(event) => {
                clearApiFieldError("end_at");
                setValues((current) => ({ ...current, end_at: event.target.value }));
              }}
              className="rounded-2xl border-border bg-muted/40"
            />
            {errors.end_at || apiFieldErrors.end_at ? (
              <p className="text-xs font-medium text-rose-600">{errors.end_at || apiFieldErrors.end_at}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Event type</Label>
            <Select
              value={values.event_type}
              onValueChange={(value) => {
                clearApiFieldError("event_type");
                setValues((current) => ({ ...current, event_type: value as ScheduleEventType }));
              }}
            >
              <SelectTrigger className="rounded-2xl border-border bg-muted/40">
                <SelectValue placeholder="Choose event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reminder</Label>
            <Select
              value={values.reminder_minutes || "none"}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  reminder_minutes: value === "none" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="rounded-2xl border-border bg-muted/40">
                <SelectValue placeholder="No reminder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No reminder</SelectItem>
                {reminderOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location">Location</Label>
          <Input
            id="event-location"
            value={values.location}
            onChange={(event) => {
              clearApiFieldError("location");
              setValues((current) => ({ ...current, location: event.target.value }));
            }}
            className="rounded-2xl border-border bg-muted/40"
            placeholder="Room 4B"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={values.description}
            onChange={(event) => {
              clearApiFieldError("description");
              setValues((current) => ({ ...current, description: event.target.value }));
            }}
            className="min-h-[110px] rounded-2xl border-border bg-muted/40"
            placeholder="Add a short note, topic focus, or prep reminder."
          />
        </div>

        <div className="space-y-3 rounded-[24px] border border-border bg-muted/40 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select
                value={values.recurrence}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    recurrence: value as ScheduleRecurrence,
                    days: value === "weekly" ? current.days : [],
                  }))
                }
              >
                <SelectTrigger className="rounded-2xl border-border bg-background">
                  <SelectValue placeholder="Choose recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                {recurrenceLabel(values.recurrence)}
                {values.recurrence === "weekly" && values.days.length ? ` · ${weekdaySummary(values.days)}` : ""}
              </div>
            </div>
          </div>

          {values.recurrence === "weekly" ? (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {weekdayOptions.map((day) => {
                  const selected = values.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          days: selected
                            ? current.days.filter((item) => item !== day.value)
                            : [...current.days, day.value],
                        }))
                      }
                      className={cn(
                        "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                        selected
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-border/80",
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              {errors.days || apiFieldErrors.days ? (
                <p className="text-xs font-medium text-rose-600">{errors.days || apiFieldErrors.days}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ResponsiveModal>
  );
};

export const ShareCalendarModal = ({
  open,
  onOpenChange,
  calendar,
  shareInfo,
  isLoading,
  qrImageUrl,
  isQrLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendar?: ScheduleCalendarSummary;
  shareInfo?: ScheduleShareInfo | null;
  isLoading?: boolean;
  qrImageUrl?: string | null;
  isQrLoading?: boolean;
}) => {
  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied`, description: "You can paste it into another app or calendar client." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard access is unavailable on this device.", variant: "destructive" });
    }
  };

  const footer = (
    <Button type="button" variant="outline" className="w-full rounded-2xl border-border bg-card sm:w-auto" onClick={() => onOpenChange(false)}>
      Close
    </Button>
  );

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Share and subscribe"
      description="Use Subscribe for feed-based updates in calendar apps. Download ICS is best for a one-time import."
      footer={footer}
      className="max-w-3xl"
    >
      {isLoading ? (
        <div className="flex items-center gap-3 rounded-[24px] border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Preparing sharing links...
        </div>
      ) : shareInfo && calendar ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary shadow-none">
                  {calendarTypeLabel(calendar.calendar_type)}
                </Badge>
                <Badge className="rounded-full border border-border bg-background text-muted-foreground shadow-none">
                  Code {shareInfo.calendar_code}
                </Badge>
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">{calendar.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Share this calendar with another device, subscribe from a calendar app, or download a static ICS snapshot.
              </p>
            </div>

            <div className="grid gap-3">
              <ActionButton
                label="Open in Calendar App"
                description="Best for feed-based updates in apps that support webcal."
                icon={Globe}
                onClick={() => window.open(shareInfo.webcal_url || shareInfo.subscribe_url, "_blank")}
              />
              <ActionButton
                label="Copy Feed URL"
                description="Copy the raw subscription link for manual setup."
                icon={Copy}
                onClick={() => void handleCopy(shareInfo.subscribe_url, "Feed URL")}
              />
              <ActionButton
                label="Download ICS"
                description="Download a static file for one-time import."
                icon={Download}
                onClick={() => window.open(shareInfo.download_url, "_blank")}
              />
              <ActionButton
                label="Copy Calendar Code"
                description="Share a short code for lookup inside Kibegi."
                icon={Copy}
                onClick={() => void handleCopy(shareInfo.calendar_code, "Calendar code")}
              />
              {shareInfo.frontend_subscription_url ? (
                <ActionButton
                  label="Open Public Page"
                  description="Preview the subscription handoff screen."
                  icon={ExternalLink}
                  onClick={() => window.open(shareInfo.frontend_subscription_url, "_blank")}
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-foreground">QR handoff</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Scan on another device to open the subscription flow instantly.
              </p>
              <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-[20px] border border-dashed border-border bg-muted/30">
                {isQrLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : qrImageUrl ? (
                  <img src={qrImageUrl} alt="Calendar QR code" className="h-52 w-52 rounded-2xl object-contain" />
                ) : (
                  <p className="px-6 text-center text-sm text-muted-foreground">QR code will appear here when sharing is enabled.</p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-muted/30 p-4">
              <p className="text-sm font-bold text-foreground">Feed note</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Calendar apps pull updates from Kibegi&apos;s ICS feed. Changes made in those apps will not sync back to Kibegi.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Sharing is unavailable"
          description="Turn on public subscription in calendar settings to generate feed and QR links."
          icon={Share2}
        />
      )}
    </ResponsiveModal>
  );
};

const ActionButton = ({
  label,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Globe;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-start gap-3 rounded-[22px] border border-border bg-card px-4 py-4 text-left shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
  >
    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
    <ArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground" />
  </button>
);

export const CalendarSettingsModal = ({
  open,
  onOpenChange,
  calendar,
  isSaving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendar?: ScheduleCalendarSummary;
  isSaving?: boolean;
  onSave: (payload: { name: string; description: string; is_public_sync: boolean }) => Promise<void> | void;
}) => {
  const [name, setName] = useState(calendar?.name || "");
  const [description, setDescription] = useState(calendar?.description || "");
  const [isPublicSync, setIsPublicSync] = useState(calendar?.is_public_sync || false);

  useEffect(() => {
    if (open && calendar) {
      setName(calendar.name || "");
      setDescription(calendar.description || "");
      setIsPublicSync(calendar.is_public_sync);
    }
  }, [calendar, open]);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Calendar settings"
      description="Rename the calendar, update the description, and control whether public subscription links stay active."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl border-border bg-card sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="hero"
            className="w-full rounded-2xl sm:w-auto"
            disabled={isSaving}
            onClick={() => void onSave({ name: name.trim(), description: description.trim(), is_public_sync: isPublicSync })}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
            Save settings
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-border bg-background text-muted-foreground shadow-none">
              {calendarTypeLabel(calendar?.calendar_type)}
            </Badge>
            <Badge className="rounded-full border border-border bg-background text-muted-foreground shadow-none">
              Code {calendar?.calendar_code}
            </Badge>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Calendar type and code are fixed by the backend. Public sync controls whether the ICS share links work.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calendar-name">Calendar name</Label>
          <Input
            id="calendar-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border-border bg-muted/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="calendar-description">Description</Label>
          <Textarea
            id="calendar-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[110px] rounded-2xl border-border bg-muted/40"
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-[24px] border border-border bg-card px-4 py-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-foreground">Enable public sync</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Keep sharing links, QR code, and ICS subscription available for this calendar.
            </p>
          </div>
          <Switch checked={isPublicSync} onCheckedChange={setIsPublicSync} />
        </div>
      </div>
    </ResponsiveModal>
  );
};

export const AgendaTabs = ({
  events,
  calendarType,
  onEditEvent,
  onAddEvent,
}: {
  events: ScheduleEvent[];
  calendarType: CalendarType;
  onEditEvent: (event: ScheduleEvent) => void;
  onAddEvent: () => void;
}) => {
  const agendaGroups = useMemo(() => groupEventsByDate(events), [events]);
  const week = useMemo(() => getWeekEvents(events), [events]);
  const month = useMemo(() => getMonthMatrix(events), [events]);

  return (
    <Tabs defaultValue="agenda" className="space-y-5">
      <TabsList className="grid h-auto w-full max-w-sm grid-cols-3 rounded-2xl bg-muted/50 p-1">
        <TabsTrigger value="agenda" className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background">
          Agenda
        </TabsTrigger>
        <TabsTrigger value="week" className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background">
          Week
        </TabsTrigger>
        <TabsTrigger value="month" className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background">
          Month
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agenda" className="space-y-5">
        {agendaGroups.length ? (
          agendaGroups.map((group) => (
            <DateGroup key={group.label} label={group.label}>
              {group.events.map((event) => (
                <EventCard key={event.id} event={event} onEdit={() => onEditEvent(event)} />
              ))}
            </DateGroup>
          ))
        ) : (
          <EmptyState
            title={`No ${calendarTypeLabel(calendarType).toLowerCase()} events yet`}
            description="Start with your first item so this planner can build a calm, readable agenda for you."
            action={
              <Button variant="hero" className="rounded-2xl" onClick={onAddEvent}>
                Add first event
              </Button>
            }
          />
        )}
      </TabsContent>

      <TabsContent value="week" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {week.map((day) => (
            <div key={day.label} className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{day.label}</p>
              <p className="mt-1 text-2xl font-black text-foreground">{day.dayNumber}</p>
              <div className="mt-4 space-y-2">
                {day.events.length ? (
                  day.events.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEditEvent(event)}
                      className="block w-full rounded-2xl border border-border bg-muted/30 px-3 py-2 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatEventTimeRange(event)}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No events</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="month" className="space-y-4">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30 px-2 py-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
              <div key={label} className="px-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/60">
            {month.map((weekRow, index) => (
              <div key={index} className="grid grid-cols-7">
                {weekRow.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "min-h-[84px] border-r border-border/60 p-3 last:border-r-0",
                      !day.inMonth && "bg-muted/20",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", day.inMonth ? "text-foreground" : "text-muted-foreground")}>
                        {format(day.date, "d")}
                      </span>
                      {day.count ? (
                        <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary shadow-none">
                          {day.count}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const PublicSubscriptionCard = ({
  info,
  isUnavailable,
  unavailableTitle,
  unavailableDescription,
}: {
  info?: PublicScheduleInfo | null;
  isUnavailable?: boolean;
  unavailableTitle?: string;
  unavailableDescription?: string;
}) => {
  const card = info ? {
    ...info,
    calendar_name: info.calendar_name || info.name || "Kibegi Schedule",
    event_count: info.event_count ?? 0,
  } : null;

  const handleCopy = async () => {
    if (!card?.subscribe_url) return;
    try {
      await navigator.clipboard.writeText(card.subscribe_url);
      toast({ title: "Feed URL copied", description: "Paste it into your calendar app to subscribe." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard access is unavailable on this device.", variant: "destructive" });
    }
  };

  if (isUnavailable || !card) {
    return (
      <EmptyState
        title={unavailableTitle || "Calendar not available"}
        description={
          unavailableDescription ||
          "This public schedule link is unavailable right now. It may be invalid, expired, or sharing has been turned off."
        }
        icon={RefreshCcw}
      />
    );
  }

  return (
    <Card className="overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)]">
      <CardHeader className="bg-gradient-to-br from-primary/10 via-card to-muted/50 px-6 pb-5 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary shadow-none">
            {calendarTypeLabel(card.calendar_type)}
          </Badge>
          {card.calendar_code ? (
            <Badge className="rounded-full border border-border bg-background text-muted-foreground shadow-none">
              Code {card.calendar_code}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="mt-4 text-2xl font-black tracking-tight text-foreground">{card.calendar_name}</CardTitle>
        <CardDescription className="mt-2 text-sm leading-6 text-muted-foreground">
          Subscribe for feed-based updates, or download an ICS file for one-time import.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border bg-muted/30 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Events</p>
            <p className="mt-2 text-2xl font-black text-foreground">{card.event_count}</p>
          </div>
          <div className="rounded-[22px] border border-border bg-muted/30 px-4 py-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Subscription keeps this calendar updated from Kibegi&apos;s ICS feed. It does not enable two-way editing.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {card.webcal_url ? (
            <Button variant="hero" className="h-12 rounded-2xl" onClick={() => window.open(card.webcal_url, "_self")}>
              Open in Calendar App
            </Button>
          ) : null}
          <Button variant="outline" className="h-12 rounded-2xl border-border bg-card" onClick={handleCopy}>
            Copy Feed URL
          </Button>
          {card.download_url ? (
            <Button variant="ghost" className="h-12 rounded-2xl text-foreground hover:bg-primary/5" onClick={() => window.open(card.download_url, "_blank")}>
              Download ICS
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendarCodeEntryForm = ({
  code,
  setCode,
  onSubmit,
  isSubmitting,
}: {
  code: string;
  setCode: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}) => (
  <Card className="rounded-[32px] border border-border/70 bg-card shadow-[0_24px_70px_-40px_rgba(15,23,42,0.28)]">
    <CardHeader className="px-6 pb-4 pt-6">
      <CardTitle className="text-2xl font-black tracking-tight text-foreground">Enter Calendar Code</CardTitle>
      <CardDescription className="text-sm leading-6 text-muted-foreground">
        Paste or type the short calendar code you received to open its subscription page.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-6 pb-6">
      <div className="space-y-2">
        <Label htmlFor="calendar-code">Calendar code</Label>
        <Input
          id="calendar-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          className="h-12 rounded-2xl border-border bg-muted/40 text-base font-semibold tracking-[0.2em]"
          placeholder="AB7K9Q"
          maxLength={12}
        />
      </div>
      <Button variant="hero" className="h-12 w-full rounded-2xl" onClick={onSubmit} disabled={isSubmitting || code.trim().length < 4}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continue
      </Button>
    </CardContent>
  </Card>
);
