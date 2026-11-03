import api from '@/lib/api';

export interface ClassData {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  is_public: boolean;
  is_verified: boolean;
  creator: string | number;
  creator_name: string;
  creator_type: 'lecturer' | 'student';
  member_count: number;
  is_member: boolean;
  user_role: 'lecturer' | 'student' | null;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  join_qr_value?: string;
  join_qr_payload?: {
    type?: string;
    class_code?: string;
    class_name?: string;
    join_endpoint?: string;
  };
  join_qr_image?: string;
}

export interface MemberData {
  id: string;
  full_name: string;
  email: string;
  user_type: 'lecturer' | 'student';
  role: 'lecturer' | 'student';
  joined_at: string;
}

export interface UploadsSummary {
  total_uploads: number;
  uploads_by_type?: {
    document?: number;
    presentation?: number;
    image?: number;
    spreadsheet?: number;
    [key: string]: number | undefined;
  };
  total_size_bytes: number;
  total_size_mb: number;
  lecturers_with_uploads: number;
  active_contributors: number;
}

export interface RecentUpload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_code: string;
  uploader_id: string;
  uploader_name: string;
  uploader_type: 'lecturer' | 'student';
  created_at: string;
}

export interface UploaderStat {
  uploader_id: string;
  uploader_name: string;
  uploader_type: 'lecturer' | 'student';
  upload_count: number;
  is_active_contributor: boolean;
}

export interface ClassDetailsData extends ClassData {
  uploads_summary?: UploadsSummary;
  recent_uploads?: RecentUpload[];
  uploader_stats?: UploaderStat[];
}

export interface CreateClassData {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface JoinClassData {
  class_code: string;
}

export interface PaginatedClassResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  errors?: unknown;
}

const classService = {
  // List classes where the current user is already a member
  listClasses: async (params?: { page?: number; page_size?: number }) => {
    const response = await api.get('/v1/classes/', { params });
    return response.data;
  },

  // Search public classes and classes already joined by the current user
  searchClasses: async (query: string, params?: { page?: number; page_size?: number }) => {
    const response = await api.get('/v1/classes/search/', {
      params: {
        q: query,
        ...params,
      },
    });
    return response.data;
  },

  // Get class details
  getClassDetails: async (classId: string): Promise<{ data: ClassDetailsData; message?: string }> => {
    const response = await api.get(`/v1/classes/${classId}/`);
    // API returns { message, data: { ... } }
    return response.data;
  },

  // Create class
  createClass: async (data: CreateClassData) => {
    const response = await api.post('/v1/classes/', data);
    return response.data;
  },

  // Update class
  updateClass: async (classId: string, data: Partial<CreateClassData>) => {
    const response = await api.patch(`/v1/classes/${classId}/`, data);
    return response.data;
  },

  // Delete class (soft delete)
  deleteClass: async (classId: string) => {
    const response = await api.delete(`/v1/classes/${classId}/`);
    return response.data;
  },

  // Join class
  joinClass: async (data: JoinClassData) => {
    const response = await api.post('/v1/classes/join/', data);
    return response.data;
  },

  // Leave class
  leaveClass: async (classId: string) => {
    const response = await api.post(`/v1/classes/${classId}/leave/`);
    return response.data;
  },

  // Get class members
  getMembers: async (classId: string, params?: { page?: number; page_size?: number }) => {
    const response = await api.get(`/v1/classes/${classId}/members/`, { params });
    return response.data;
  },

  // Restore deleted class
  restoreClass: async (classId: string) => {
    const response = await api.post(`/v1/classes/${classId}/restore/`);
    return response.data;
  },
};

export default classService;
