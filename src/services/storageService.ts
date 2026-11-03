import api from '@/lib/api';

export interface StorageData {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  total_quota_mb: number;
  used_storage_bytes: number;
  used_storage_mb: number;
  free_storage_mb: number;
  free_storage_bytes: number;
  usage_percentage: number;
  is_full: boolean;
  is_near_limit: boolean;
  created_at: string;
  updated_at: string;
  last_calculated: string;
}

export interface StorageInfo {
  total_quota_mb: number;
  used_storage_mb: number;
  free_storage_mb: number;
  used_storage_bytes: number;
  free_storage_bytes: number;
  usage_percentage: number;
  is_full: boolean;
  is_near_limit: boolean;
  last_calculated: string;
}

export interface StorageUsageHistory {
  id: number;
  user_storage: number;
  used_storage_bytes: number;
  used_storage_mb: number;
  recorded_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

const storageService = {
  // Get storage information
  // API: GET /api/v1/storage/
  getStorage: async (): Promise<StorageData> => {
    console.log('🔵 Fetching storage information');
    const response = await api.get('/v1/storage/');
    console.log('🟢 Storage response:', response.data);
    return unwrapData<StorageData>(response.data);
  },

  // Get detailed storage info
  // API: GET /api/v1/storage/info/
  getStorageInfo: async (): Promise<StorageInfo> => {
    console.log('🔵 Fetching detailed storage info');
    const response = await api.get('/v1/storage/info/');
    console.log('🟢 Storage info response:', response.data);
    return unwrapData<StorageInfo>(response.data);
  },

  // Recalculate storage
  // API: POST /api/v1/storage/recalculate/
  recalculateStorage: async (): Promise<StorageInfo> => {
    console.log('🔵 Recalculating storage');
    const response = await api.post('/v1/storage/recalculate/');
    console.log('🟢 Recalculate response:', response.data);
    return unwrapData<StorageInfo>(response.data);
  },

  // Get usage history
  // API: GET /api/v1/storage/history/?limit=30
  getUsageHistory: async (limit: number = 30): Promise<StorageUsageHistory[]> => {
    console.log('🔵 Fetching storage usage history');
    const response = await api.get('/v1/storage/history/', {
      params: { limit }
    });
    console.log('🟢 Storage history response:', response.data);
    const data = unwrapData<StorageUsageHistory[]>(response.data);
    return Array.isArray(data) ? data : [];
  },
};

export default storageService;


