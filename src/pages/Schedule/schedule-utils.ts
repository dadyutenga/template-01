import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isThisWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarType,
  PublicScheduleInfo,
  ScheduleEvent,
  ScheduleEventType,
  ScheduleRecurrence,
  WeekdayName,
} from "@/services/scheduleService";

export const weekdayOptions: Array<{ label: string; value: WeekdayName; short: string }> = [
  { label: "Monday", value: "monday", short: "Mon" },
  { label: "Tuesday", value: "tuesday", short: "Tue" },
  { label: "Wednesday", value: "wednesday", short: "Wed" },
  { label: "Thursday", value: "thursday", short: "Thu" },
  { label: "Friday", value: "friday", short: "Fri" },
  { label: "Saturday", value: "saturday", short: "Sat" },
  { label: "Sunday", value: "sunday", short: "Sun" },
];

export const eventTypeOptions: Array<{ value: ScheduleEventType; label: string }> = [
  { value: "class", label: "Class" },
  { value: "exam", label: "Exam" },
  { value: "study", label: "Study" },
  { value: "deadline", label: "Deadline" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

export const recurrenceOptions: Array<{ value: ScheduleRecurrence; label: string }> = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const reminderOptions: Array<{ value: number; label: string }> = [
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 20, label: "20 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
];

export const calendarTypeLabel = (type?: CalendarType) => {
  if (type === "classes") return "Classes";
  if (type === "examination") return "Examinations";
  return "Schedule";
};

export const calendarTitleForCard = (type?: CalendarType, name?: string) => {
  if (name) return name;
  return type === "examination" ? "My Examinations" : "My Classes";
};

export const calendarAccentClasses = (type?: CalendarType) =>
  type === "examination"
    ? "from-cyan-500/10 via-card to-muted/40 text-foreground ring-border"
    : "from-sky-500/10 via-card to-muted/40 text-foreground ring-border";

export const eventTypeTone = (type: ScheduleEventType) => {
  switch (type) {
    case "exam":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "deadline":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "study":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "meeting":
      return "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "other":
      return "border-border bg-muted/40 text-muted-foreground";
    default:
      return "border-primary/20 bg-primary/10 text-primary";
  }
};

export const eventTypeLabel = (type: ScheduleEventType) =>
  eventTypeOptions.find((option) => option.value === type)?.label || "Event";

export const recurrenceLabel = (recurrence: ScheduleRecurrence) => {
  if (recurrence === "none") return "One-time";
  return recurrence.charAt(0).toUpperCase() + recurrence.slice(1);
};

export const formatDateHeading = (date: Date) => {
  if (isToday(date)) return `Today · ${format(date, "EEEE, MMM d")}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, "EEEE, MMM d")}`;
  return format(date, "EEEE, MMM d");
};

export const formatEventTimeRange = (event: ScheduleEvent) =>
  `${format(parseISO(event.start_at), "h:mm a")} - ${format(parseISO(event.end_at), "h:mm a")}`;

export const normalizePublicInfo = (payload: PublicScheduleInfo) => ({
  ...payload,
  calendar_name: payload.calendar_name || payload.name || "Kibegi Schedule",
  event_count: payload.event_count ?? 0,
});

export const groupEventsByDate = (events: ScheduleEvent[]) => {
  const groups = new Map<string, { date: Date; label: string; events: ScheduleEvent[] }>();

  [...events]
    .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime())
    .forEach((event) => {
      const date = parseISO(event.start_at);
      const key = format(date, "yyyy-MM-dd");
      if (!groups.has(key)) {
        groups.set(key, {
          date,
          label: formatDateHeading(date),
          events: [],
        });
      }
      groups.get(key)?.events.push(event);
    });

  return Array.from(groups.values());
};

export const groupUpcomingEvents = (events: Array<ScheduleEvent & { calendar_type?: CalendarType }>) => {
  const now = new Date();
  const visible = events
    .filter((event) => isAfter(parseISO(event.end_at), now) || isSameDay(parseISO(event.start_at), now))
    .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime())
    .slice(0, 10);

  const groups = new Map<string, { label: string; events: Array<ScheduleEvent & { calendar_type?: CalendarType }> }>();

  visible.forEach((event) => {
    const date = parseISO(event.start_at);
    let label = format(date, "EEEE");
    if (isToday(date)) label = "Today";
    else if (isTomorrow(date)) label = "Tomorrow";
    else if (isThisWeek(date, { weekStartsOn: 1 })) label = "This Week";
    else label = format(date, "MMM d");

    if (!groups.has(label)) groups.set(label, { label, events: [] });
    groups.get(label)?.events.push(event);
  });

  return Array.from(groups.values());
};

export const getWeekEvents = (events: ScheduleEvent[]) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      label: format(date, "EEE"),
      dayNumber: format(date, "d"),
      events: events
        .filter((event) => {
          const startAt = parseISO(event.start_at);
          return startAt >= start && startAt <= end && isSameDay(startAt, date);
        })
        .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime()),
    };
  });

  return days;
};

export const getMonthMatrix = (events: ScheduleEvent[]) => {
  const start = startOfWeek(startOfMonth(new Date()), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date()), { weekStartsOn: 1 });
  const days = [];
  let cursor = start;

  while (cursor <= end) {
    days.push({
      date: cursor,
      inMonth: cursor.getMonth() === new Date().getMonth(),
      count: events.filter((event) => isSameDay(parseISO(event.start_at), cursor)).length,
    });
    cursor = addDays(cursor, 1);
  }

  const weeks = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
};

export const toLocalDateTimeInputValue = (value?: string) => {
  if (!value) return "";
  return format(parseISO(value), "yyyy-MM-dd'T'HH:mm");
};

export const weekdaySummary = (days?: WeekdayName[]) => {
  if (!days?.length) return null;
  return days
    .map((day) => weekdayOptions.find((item) => item.value === day)?.short || day)
    .join(", ");
};
