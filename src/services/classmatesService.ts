import api from '@/lib/api';

export interface ClassmateUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'lecturer';
}

export interface ClassmatesResponse {
  success: boolean;
  message: string;
  data: ClassmateUser[];
}

const classmatesService = {
  // Get classmates from the same class as the file
  getClassmatesForFile: async (fileCode: string): Promise<ClassmatesResponse> => {
    const response = await api.get<ClassmatesResponse>(`/v1/files/${fileCode}/classmates/`);
    return response.data;
  },

  // Get all classmates (from all user's classes)
  getAllClassmates: async (): Promise<ClassmatesResponse> => {
    const response = await api.get<ClassmatesResponse>('/v1/classmates/');
    return response.data;
  },
};

export default classmatesService;
