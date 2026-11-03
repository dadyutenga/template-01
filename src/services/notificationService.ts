import api from '@/lib/api';

export type NotificationType =
  | 'share_request'
  | 'share_accepted'
  | 'share_rejected'
  | 'friend_request'
  | 'friend_accepted'
  | 'upload_created'
  | 'class_joined';

export interface NotificationData {
  id: number;
  notification_type: NotificationType;
  content: string;
  related_object_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListPayload {
  count: number;
  next: string | null;
  previous: string | null;
  unread_count: number;
  results: NotificationData[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UnreadCountPayload {
  unread_count: number;
}

const unwrapList = (payload: any): NotificationListPayload => {
  console.log('📦 NotificationService - Unwrapping notification list response:', payload);
  
  // API returns: { success: true, message: "Retrieved 15 notifications", data: { count, next, previous, unread_count, results: [...] } }
  if (payload && typeof payload === 'object') {
    // Check if wrapped in { success, message, data: { ... } }
    if ('data' in payload && payload.data && typeof payload.data === 'object') {
      const data = payload.data;
      if ('results' in data) {
        console.log('📦 NotificationService - Found wrapped response with data.results');
        return {
          count: data.count ?? 0,
          next: data.next ?? null,
          previous: data.previous ?? null,
          unread_count: data.unread_count ?? 0,
          results: Array.isArray(data.results) ? data.results : [],
        };
      }
    }
    
    // Handle direct response (without wrapper) - { count, next, previous, unread_count, results: [...] }
    if ('results' in payload) {
      console.log('📦 NotificationService - Found direct response with results');
      return {
        count: payload.count ?? 0,
        next: payload.next ?? null,
        previous: payload.previous ?? null,
        unread_count: payload.unread_count ?? 0,
        results: Array.isArray(payload.results) ? payload.results : [],
      };
    }
  }

  // Fallback - empty result
  console.warn('⚠️ NotificationService - Could not unwrap response, returning empty list');
  return {
    count: 0,
    next: null,
    previous: null,
    unread_count: 0,
    results: [],
  };
};

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const notificationService = {
  // Fast unread count polling
  // API: GET /api/v1/notifications/unread-count/
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/v1/notifications/unread-count/');
    const data = unwrapData<UnreadCountPayload>(response.data);
    return data?.unread_count ?? 0;
  },

  // List notifications with optional filters
  // API: GET /api/v1/notifications/?is_read=true|false|all&type=<notification_type>&page=1&page_size=20
  listNotifications: async (params?: {
    is_read?: 'true' | 'false' | 'all';
    type?: NotificationType;
    page?: number;
    page_size?: number;
  }): Promise<NotificationListPayload> => {
    console.log('🔵 NotificationService - Fetching notifications with params:', params);
    
    // Build query params - API expects strings for is_read and type, numbers for page/page_size
    const queryParams: Record<string, string | number> = {};
    if (params?.is_read) {
      queryParams.is_read = params.is_read;
    }
    if (params?.type) {
      queryParams.type = params.type;
    }
    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params?.page_size !== undefined) {
      queryParams.page_size = params.page_size;
    }
    
    console.log('🔵 NotificationService - Query params:', queryParams);
    
    const response = await api.get('/v1/notifications/', {
      params: queryParams,
    });
    
    console.log('🟢 NotificationService - Raw response:', response);
    console.log('🟢 NotificationService - Response data:', response.data);
    
    // API returns: { success: true, message: "...", data: { count, next, previous, unread_count, results: [...] } }
    const responseData = response.data;
    const unwrapped = unwrapList(responseData);
    console.log('🟢 NotificationService - Unwrapped data:', unwrapped);
    return unwrapped;
  },

  // Mark notification as read
  // API: POST /api/v1/notifications/{notification_id}/read/
  markAsRead: async (notificationId: number): Promise<NotificationData> => {
    console.log('🔵 NotificationService - Marking notification as read:', notificationId);
    const response = await api.post(`/v1/notifications/${notificationId}/read/`);
    console.log('🟢 NotificationService - Mark as read response:', response.data);
    
    // API returns: { success: true, message: "Notification marked as read", data: { ...notification } }
    const unwrapped = unwrapData<NotificationData>(response.data);
    console.log('🟢 NotificationService - Unwrapped notification:', unwrapped);
    return unwrapped;
  },

  // Mark all notifications as read
  // API: POST /api/v1/notifications/read-all/
  markAllAsRead: async (): Promise<{ marked_read: number }> => {
    console.log('🔵 NotificationService - Marking all notifications as read');
    const response = await api.post('/v1/notifications/read-all/');
    console.log('🟢 NotificationService - Mark all as read response:', response.data);
    
    // API returns: { success: true, message: "Marked 5 notifications as read", data: { marked_read: 5 } }
    const unwrapped = unwrapData<{ marked_read: number }>(response.data);
    console.log('🟢 NotificationService - Unwrapped marked_read:', unwrapped);
    return unwrapped;
  },

  // Delete notification
  // API: DELETE /api/v1/notifications/{notification_id}/
  deleteNotification: async (notificationId: number): Promise<void> => {
    console.log('🔵 NotificationService - Deleting notification:', notificationId);
    const response = await api.delete(`/v1/notifications/${notificationId}/`);
    console.log('🟢 NotificationService - Delete notification response:', response.data);
    
    // API returns: { success: true, message: "Notification deleted successfully" }
    // No data field in delete response
    return;
  },
};

export default notificationService;
