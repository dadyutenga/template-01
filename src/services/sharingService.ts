import api from '@/lib/api';

export interface SharedFileData {
  id: string;
  upload: {
    id: string;
    file_code: string;
    file_name: string;
    file_type: string;
    file_size: number;
  };
  shared_by: string;
  shared_by_name: string;
  shared_with: string;
  shared_with_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  shared_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  can_access: boolean;
}

export interface SharedFileListItem {
  id: string;
  file_code: string;
  file_name: string;
  file_type: string;
  file_size: number;
  shared_by: string;
  shared_by_name: string;
  shared_with: string;
  shared_with_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  shared_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
}

export interface PaginatedShares {
  count: number;
  next: string | null;
  previous: string | null;
  results: SharedFileListItem[];
}

interface ShareApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const unwrapListResponse = (payload: any): PaginatedShares => {
  console.log('📦 Unwrapping list response:', payload);
  
  // API returns: { success: true, message: "...", data: { count, next, previous, results: [...] } }
  if (payload && typeof payload === 'object') {
    // Check if wrapped in { success, message, data: { ... } }
    if ('data' in payload && payload.data && typeof payload.data === 'object') {
      const data = payload.data;
      if ('results' in data) {
        console.log('📦 Found wrapped response with data.results');
        return {
          count: data.count ?? 0,
          next: data.next ?? null,
          previous: data.previous ?? null,
          results: Array.isArray(data.results) ? data.results : [],
        };
      }
    }
    
    // Handle direct response (without wrapper) - { count, next, previous, results: [...] }
    if ('results' in payload) {
      console.log('📦 Found direct response with results');
      return {
        count: payload.count ?? 0,
        next: payload.next ?? null,
        previous: payload.previous ?? null,
        results: Array.isArray(payload.results) ? payload.results : [],
      };
    }
  }
  
  // Fallback - empty result
  console.warn('⚠️ Could not unwrap list response, returning empty list');
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

const sharingService = {
  // Share a file with a user
  shareFile: async (fileCode: string, sharedWithId: string | number, message: string = ''): Promise<ShareApiResponse<SharedFileData>> => {
    console.log('🔵 Sharing file:', { fileCode, sharedWithId, message, sharedWithIdType: typeof sharedWithId });
    
    // Validate inputs
    if (!fileCode || typeof fileCode !== 'string' || fileCode.trim() === '') {
      throw new Error('File code is required and must be a valid string');
    }
    
    // API expects shared_with_id as a number (integer)
    // Try to parse if it's a string, but keep as-is if it's already a number
    let userId: number;
    if (typeof sharedWithId === 'string') {
      // Try parsing as integer first
      const parsed = parseInt(sharedWithId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        userId = parsed;
      } else {
        // If parsing fails, it might be a UUID string - check if it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(sharedWithId)) {
          // It's a UUID, but API might expect integer - throw error to inform user
          throw new Error('Invalid user ID format. Please select a valid friend from the list.');
        } else {
          throw new Error('Invalid user ID provided for sharing. Please select a valid friend.');
        }
      }
    } else {
      userId = sharedWithId;
    }
    
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID provided for sharing. Please select a valid friend.');
    }
    
    try {
      // Try sending as integer first (as per API docs)
      // If that fails, we'll try as string in the error handler
      const requestBody = {
        file_code: fileCode.trim(),
        shared_with_id: userId, // Send as integer (number)
        message: (message || '').trim(),
      };
      
      console.log('🔵 Share request body:', requestBody);
      console.log('🔵 Share request body type check:', {
        file_code: typeof requestBody.file_code,
        shared_with_id: typeof requestBody.shared_with_id,
        shared_with_id_value: requestBody.shared_with_id,
        shared_with_id_isInteger: Number.isInteger(requestBody.shared_with_id),
        message: typeof requestBody.message
      });
      
      const response = await api.post<ShareApiResponse<SharedFileData>>('/v1/sharing/', requestBody, {
        validateStatus: (status) => {
          // Don't throw error for any status, let us handle it
          return status >= 200 && status < 600;
        }
      });
      
      console.log('🟢 Share response status:', response.status);
      console.log('🟢 Share response data:', response.data);
      console.log('🟢 Share response headers:', response.headers);
      
      // Check if response indicates an error
      if (response.status >= 400) {
        // Treat as error even though we didn't throw
        const errorData = response.data;
        let errorMessage = 'Failed to share file';
        
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorMessage;
          } else if (errorData.errors) {
            if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ');
            } else if (typeof errorData.errors === 'object') {
              const errorMessages = Object.entries(errorData.errors).map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${value}`;
              });
              errorMessage = errorMessages.join('; ');
            }
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors.join(', ')
              : errorData.non_field_errors;
          }
        }
        
        const error = new Error(errorMessage);
        (error as any).response = { data: errorData, status: response.status, statusText: response.statusText };
        (error as any).status = response.status;
        throw error;
      }
      
      // Handle both wrapped { success, message, data } and direct response
      const responseData = response.data;
      if (responseData && typeof responseData === 'object') {
        // If it has success field, it's already wrapped
        if ('success' in responseData) {
          return responseData as ShareApiResponse<SharedFileData>;
        }
        // If it has data field, wrap it
        if ('data' in responseData) {
          return {
            success: true,
            message: (responseData as any).message || 'File shared successfully',
            data: responseData.data as SharedFileData
          };
        }
        // Otherwise, wrap the whole response
        return {
          success: true,
          message: 'File shared successfully',
          data: responseData as SharedFileData
        };
      }
      
      return responseData as ShareApiResponse<SharedFileData>;
    } catch (error: any) {
      console.error('🔴 Share error:', error);
      console.error('🔴 Share error response:', error.response?.data);
      console.error('🔴 Share error status:', error.response?.status);
      console.error('🔴 Share error statusText:', error.response?.statusText);
      console.error('🔴 Share error headers:', error.response?.headers);
      console.error('🔴 Share error config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      });
      
      // Log the full error for debugging
      console.error('🔴 Full error object:', JSON.stringify(error, null, 2));
      console.error('🔴 Error response data (stringified):', error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data');
      
      // Extract detailed error message
      let errorMessage = 'Failed to share file';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Try different error message formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error?.message || errorMessage;
        } else if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData.errors === 'object') {
            const errorMessages = Object.entries(errorData.errors).map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            });
            errorMessage = errorMessages.join('; ');
          }
        } else if (errorData.non_field_errors) {
          // Django REST framework format
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a more informative error
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).status = error.response?.status;
      (enhancedError as any).originalError = error;
      (enhancedError as any).requestBody = {
        file_code: fileCode.trim(),
        shared_with_id: userId,
        message: (message || '').trim(),
      };
      
      throw enhancedError;
    }
  },

  // Bulk share with multiple users (max 50 users)
  bulkShare: async (fileCode: string, userIds: (string | number)[], message: string = ''): Promise<ShareApiResponse<{ status: string; user_count: number; file_code: string }>> => {
    console.log('🔵 Bulk sharing file:', { fileCode, userIdCount: userIds.length, message });
    
    // Convert user IDs to numbers
    const numericUserIds = userIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0);
    
    if (numericUserIds.length === 0) {
      throw new Error('At least one valid user ID is required for bulk sharing');
    }
    
    if (numericUserIds.length > 50) {
      throw new Error('Cannot share with more than 50 users at once');
    }
    
    try {
      const requestBody = {
        file_code: fileCode.trim(),
        user_ids: numericUserIds,
        message: (message || '').trim(),
      };
      
      console.log('🔵 Bulk share request body:', requestBody);
      
      const response = await api.post<ShareApiResponse<{ status: string; user_count: number; file_code: string }>>('/v1/sharing/bulk/', requestBody);
      console.log('🟢 Bulk share response:', response.data);
      
      // API returns 202 Accepted with { success, message, data: { status, user_count, file_code } }
      return response.data;
    } catch (error: any) {
      console.error('🔴 Bulk share error:', error);
      throw error;
    }
  },

  // Get pending share requests (sent to you, awaiting your action)
  listPendingRequests: async (): Promise<PaginatedShares> => {
    console.log('🔵 Fetching pending share requests');
    const response = await api.get('/v1/sharing/requests/');
    console.log('🟢 Pending requests response:', response.data);
    
    // API returns: { success: true, message: "...", data: { count, next, previous, results: [...] } }
    return unwrapListResponse(response.data);
  },

  // Get files shared with me (all files that have been shared with you)
  listSharedWithMe: async (status?: 'pending' | 'accepted' | 'rejected'): Promise<PaginatedShares> => {
    console.log('🔵 Fetching files shared with me:', { status });
    
    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }
    
    const response = await api.get('/v1/sharing/shared-with-me/', {
      params,
    });
    console.log('🟢 Shared with me response:', response.data);
    
    // API returns: { success: true, message: "...", data: { count, next, previous, results: [...] } }
    return unwrapListResponse(response.data);
  },

  // Get my shares (all files you have shared with others)
  listMyShares: async (status?: 'pending' | 'accepted' | 'rejected'): Promise<PaginatedShares> => {
    console.log('🔵 Fetching my shares:', { status });
    
    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }
    
    const response = await api.get('/v1/sharing/my-shares/', {
      params,
    });
    console.log('🟢 My shares response:', response.data);
    
    // API returns: { success: true, message: "...", data: { count, next, previous, results: [...] } }
    return unwrapListResponse(response.data);
  },

  // Accept a share (recipient accepts pending share request)
  acceptShare: async (shareId: string): Promise<SharedFileData> => {
    console.log('🔵 Accepting share:', shareId);
    
    try {
      const response = await api.post<ShareApiResponse<SharedFileData>>(`/v1/sharing/${shareId}/accept/`);
      console.log('🟢 Accept share response:', response.data);
      
      // API returns: { success: true, message: "...", data: { ...share with status: "accepted" } }
      return unwrapData<SharedFileData>(response.data);
    } catch (error: any) {
      console.error('🔴 Accept share error:', error);
      throw error;
    }
  },

  // Reject a share (recipient rejects pending share request)
  rejectShare: async (shareId: string): Promise<SharedFileData> => {
    console.log('🔵 Rejecting share:', shareId);
    
    try {
      const response = await api.post<ShareApiResponse<SharedFileData>>(`/v1/sharing/${shareId}/reject/`);
      console.log('🟢 Reject share response:', response.data);
      
      // API returns: { success: true, message: "Share rejected", data: { ...share with status: "rejected" } }
      return unwrapData<SharedFileData>(response.data);
    } catch (error: any) {
      console.error('🔴 Reject share error:', error);
      throw error;
    }
  },

  // Get share details (detailed information about a specific share)
  getShareDetails: async (shareId: string): Promise<SharedFileData> => {
    console.log('🔵 Fetching share details:', shareId);
    
    try {
      const response = await api.get<ShareApiResponse<SharedFileData>>(`/v1/sharing/${shareId}/`);
      console.log('🟢 Share details response:', response.data);
      
      // API returns: { success: true, message: "...", data: { ...full share details with upload info } }
      return unwrapData<SharedFileData>(response.data);
    } catch (error: any) {
      console.error('🔴 Get share details error:', error);
      throw error;
    }
  },

  // Download shared file (must be accepted and recipient must be authorized)
  downloadSharedFile: async (shareId: string, fileName?: string): Promise<void> => {
    console.log('🔵 Downloading shared file:', { shareId, fileName });
    
    try {
      const response = await api.get<Blob>(`/v1/sharing/${shareId}/download/`, {
        responseType: 'blob',
      });
      
      console.log('🟢 Download response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentDisposition: response.headers['content-disposition'],
      });
      
      // Get filename from Content-Disposition header or use provided filename
      let downloadFileName = fileName;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ File download initiated');
    } catch (error: any) {
      console.error('🔴 Download error:', error);
      throw error;
    }
  },
};

export default sharingService;
