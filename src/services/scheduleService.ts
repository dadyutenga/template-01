import axios from "axios";
import api from "@/lib/api";

export type CalendarType = "classes" | "examination";
export type ScheduleEventType = "class" | "exam" | "study" | "deadline" | "meeting" | "other";
export type ScheduleRecurrence = "none" | "daily" | "weekly" | "monthly";
export type WeekdayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface ScheduleEvent {
  id: number | string;
  calendar?: number | string;
  title: string;
  description?: string;
  location?: string;
  start_at: string;
  end_at: string;
  event_type: ScheduleEventType;
  recurrence: ScheduleRecurrence;
  days?: WeekdayName[];
  reminder_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleCalendarSummary {
  id: number | string;
  name: string;
  calendar_type: CalendarType;
  description?: string;
  is_public_sync: boolean;
  calendar_code: string;
  event_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleCalendarDetail extends ScheduleCalendarSummary {
  events: ScheduleEvent[];
}

export interface ScheduleShareInfo {
  calendar_id: string;
  calendar_type: CalendarType;
  calendar_code: string;
  subscribe_url: string;
  download_url: string;
  webcal_url: string;
  subscription_page_url: string;
  frontend_subscription_url?: string;
  code_lookup_url: string;
}

export interface PublicScheduleInfo {
  calendar_id?: string | number;
  calendar_type?: CalendarType;
  calendar_code?: string;
  name?: string;
  calendar_name?: string;
  description?: string;
  event_count?: number;
  subscribe_url?: string;
  download_url?: string;
  webcal_url?: string;
  frontend_subscription_url?: string;
  code_lookup_url?: string;
  subscription_page_url?: string;
}

export interface ScheduleCalendarUpdateInput {
  name?: string;
  description?: string;
  is_public_sync?: boolean;
}

export interface ScheduleEventInput {
  title: string;
  description?: string;
  location?: string;
  start_at: string;
  end_at: string;
  event_type: ScheduleEventType;
  recurrence: ScheduleRecurrence;
  days?: WeekdayName[];
  reminder_minutes?: number | null;
}

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.kibegi.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

const extractPayload = <T,>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const scheduleService = {
  listCalendars: async (): Promise<ScheduleCalendarSummary[]> => {
    const response = await api.get("/v1/schedule/calendars/");
    return extractPayload<ScheduleCalendarSummary[]>(response.data);
  },

  getCalendar: async (calendarId: string | number): Promise<ScheduleCalendarDetail> => {
    const response = await api.get(`/v1/schedule/calendars/${calendarId}/`);
    return extractPayload<ScheduleCalendarDetail>(response.data);
  },

  getCalendarEvents: async (calendarId: string | number): Promise<ScheduleEvent[]> => {
    const response = await api.get(`/v1/schedule/calendars/${calendarId}/events/`);
    return extractPayload<ScheduleEvent[]>(response.data);
  },

  createEvent: async (calendarId: string | number, payload: ScheduleEventInput): Promise<ScheduleEvent> => {
    const response = await api.post(`/v1/schedule/calendars/${calendarId}/events/`, payload);
    return extractPayload<ScheduleEvent>(response.data);
  },

  getEvent: async (eventId: string | number): Promise<ScheduleEvent> => {
    const response = await api.get(`/v1/schedule/events/${eventId}/`);
    return extractPayload<ScheduleEvent>(response.data);
  },

  updateEvent: async (
    eventId: string | number,
    payload: Partial<ScheduleEventInput>,
  ): Promise<ScheduleEvent> => {
    const response = await api.patch(`/v1/schedule/events/${eventId}/`, payload);
    return extractPayload<ScheduleEvent>(response.data);
  },

  deleteEvent: async (eventId: string | number) => {
    const response = await api.delete(`/v1/schedule/events/${eventId}/`);
    return response.data;
  },

  updateCalendar: async (
    calendarId: string | number,
    payload: ScheduleCalendarUpdateInput,
  ): Promise<ScheduleCalendarDetail> => {
    const response = await api.patch(`/v1/schedule/calendars/${calendarId}/`, payload);
    return extractPayload<ScheduleCalendarDetail>(response.data);
  },

  getShareInfo: async (calendarId: string | number): Promise<ScheduleShareInfo> => {
    const response = await api.get(`/v1/schedule/calendars/${calendarId}/share/`);
    return extractPayload<ScheduleShareInfo>(response.data);
  },

  getCalendarQrBlob: async (calendarId: string | number): Promise<Blob> => {
    const response = await api.get(`/v1/schedule/calendars/${calendarId}/qr/`, {
      responseType: "blob",
    });
    return response.data;
  },

  getPublicInfoByToken: async (token: string): Promise<PublicScheduleInfo> => {
    const response = await publicApi.get(`/v1/public/schedule/${token}/info/`);
    return extractPayload<PublicScheduleInfo>(response.data);
  },

  getPublicInfoByCode: async (code: string): Promise<PublicScheduleInfo> => {
    const response = await publicApi.get(`/v1/public/schedule/code/${code}/info/`);
    return extractPayload<PublicScheduleInfo>(response.data);
  },
};

export default scheduleService;
