import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'lecturer';
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface FileData {
  id: string;
  file_code: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  source: 'upload' | 'shared';
  owner: UserInfo;
  uploaded_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  shared_by: UserInfo | null;
  shared_at: string | null;
  accepted: boolean | null;
  days_until_permanent_deletion?: number;
  was_accepted?: boolean | null;
}

export interface FileResponse {
  success: boolean;
  message: string;
  data: FileData | FileData[];
}

const normalizeUserInfo = (user: UserInfo | null): UserInfo | null => {
  if (!user) return null;
  const profileImageUrl = resolveMediaUrl(user.profile_image_url || user.profile_image || null);
  return {
    ...user,
    profile_image: profileImageUrl,
    profile_image_url: profileImageUrl,
  };
};

const normalizeFile = (file: FileData): FileData => ({
  ...file,
  owner: normalizeUserInfo(file.owner)!,
  shared_by: normalizeUserInfo(file.shared_by),
});

const fileService = {
  // Get all files (uploads + shared)
  getAllFiles: async (): Promise<FileResponse> => {
    const response = await api.get<FileResponse>('/v1/files/all/');
    return {
      ...response.data,
      data: Array.isArray(response.data.data) ? response.data.data.map(normalizeFile) : normalizeFile(response.data.data),
    };
  },

  // Get only user's uploads
  getMyUploads: async (): Promise<FileResponse> => {
    const response = await api.get<FileResponse>('/v1/files/my-uploads/');
    return {
      ...response.data,
      data: Array.isArray(response.data.data) ? response.data.data.map(normalizeFile) : normalizeFile(response.data.data),
    };
  },

  // Get only files shared with user
  getSharedWithMe: async (): Promise<FileResponse> => {
    const response = await api.get<FileResponse>('/v1/files/shared-with-me/');
    return {
      ...response.data,
      data: Array.isArray(response.data.data) ? response.data.data.map(normalizeFile) : normalizeFile(response.data.data),
    };
  },

  // Get deleted files (trash)
  getDeletedFiles: async (): Promise<FileResponse> => {
    const response = await api.get<FileResponse>('/v1/files/deleted/');
    return {
      ...response.data,
      data: Array.isArray(response.data.data) ? response.data.data.map(normalizeFile) : normalizeFile(response.data.data),
    };
  },

  // Get single file details by file_code
  getFileByCode: async (fileCode: string): Promise<FileResponse> => {
    const response = await api.get<FileResponse>(`/v1/files/${fileCode}/`);
    return {
      ...response.data,
      data: Array.isArray(response.data.data) ? response.data.data.map(normalizeFile) : normalizeFile(response.data.data),
    };
  },

  // Restore file from trash
  restoreFile: async (fileCode: string): Promise<FileResponse> => {
    const response = await api.post<FileResponse>(`/v1/files/${fileCode}/restore/`);
    return response.data;
  },

  // Permanently delete file
  permanentDeleteFile: async (fileCode: string): Promise<FileResponse> => {
    const response = await api.delete<FileResponse>(`/v1/files/${fileCode}/permanent-delete/`);
    return response.data;
  },
};

export default fileService;
