
import api from '@/lib/api';
import { authStorage } from '@/lib/authStorage';

// Backend-aligned interfaces
export interface UploadData {
  id: string;
  file: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_code: string;
  uploader: string;
  uploader_name: string;
  class_obj: string;
  class_name: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export interface UploadListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UploadData[];
}

const uploadService = {
  // List files (optionally by class)
  listUploads: async (params?: { page?: number; page_size?: number; class_id?: string }) => {
    const response = await api.get<UploadListResponse>('/v1/uploads/', { params });
    return response.data;
  },

  // Upload a file (multipart/form-data) - Use fetch for mobile, axios for desktop
  uploadFile: async (formData: FormData) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('🔵 Upload Service - Starting upload to /v1/uploads/', { isMobile });
    
    // IMPORTANT: On mobile, iterating FormData.entries() consumes the data
    const hasFile = formData.has("file");
    const hasClass = formData.has("class_obj");
    const hasFileName = formData.has("file_name");
    
    console.log('🔵 Upload Service - FormData check:', {
      hasFile,
      hasClass,
      hasFileName,
      isMobile
    });
    
    // Use fetch directly on mobile (more reliable on real devices)
    // Use axios on desktop (works well there)
    if (isMobile) {
      console.log('📱 Mobile device detected - using fetch API directly');
      return await uploadFileWithFetch(formData);
    }
    
    // Desktop: Use axios
    try {
      console.log('🖥️ Desktop device - using axios');
      console.log('🔵 Upload Service - FormData contents (desktop only):');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      const timeout = 600000; // 10 minutes for large files up to 50MB
      
      const requestConfig: any = {
        timeout,
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        },
      };
      
      console.log('🔵 Upload Service - Attempting with axios:', {
        timeout,
        hasFile,
        hasClass
      });
      
      const response = await api.post('/v1/uploads/', formData, requestConfig);
      
      console.log('🟢 Upload service - Success with axios:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (axiosError: any) {
      console.error('🔴 Upload service - Axios error:', {
        message: axiosError.message,
        code: axiosError.code,
        response: axiosError.response,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      
      throw axiosError;
    }
  },

  // Get file details by file_code
  getFileDetails: async (fileCode: string) => {
    const response = await api.get(`/v1/uploads/${fileCode}/`);
    return response.data;
  },

  // Update file metadata (PATCH)
  updateFile: async (fileCode: string, data: Partial<{ file_name: string; class_obj: string }>) => {
    const response = await api.patch(`/v1/uploads/${fileCode}/`, data);
    return response.data;
  },

  // Soft delete file (by file_code)
  deleteFile: async (fileCode: string) => {
    const response = await api.delete(`/v1/uploads/${fileCode}/`);
    return response.data;
  },

  // Restore soft-deleted file
  restoreFile: async (fileCode: string) => {
    const response = await api.post(`/v1/uploads/${fileCode}/restore/`);
    return response.data;
  },

  // Permanently delete file (by UUID)
  permanentDelete: async (fileId: string) => {
    const response = await api.delete(`/v1/uploads/${fileId}/permanent-delete/`);
    return response.data;
  },

  // Download file by file_code
  downloadFile: async (fileCode: string, fileName: string) => {
    const response = await api.get(`/v1/uploads/${fileCode}/download/`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get recent uploads
  getRecentUploads: async (params?: { page?: number; page_size?: number }) => {
    const response = await api.get<UploadListResponse>('/v1/uploads/recent/', { params });
    return response.data;
  },
};

// Upload using native fetch API (optimized for mobile)
// CRITICAL: Use original FormData on first attempt, only extract for retries
const uploadFileWithFetch = async (formData: FormData) => {
  const baseURL = import.meta.env.VITE_API_URL || 'https://api.kibegi.com/api';
  const url = `${baseURL}/v1/uploads/`;
  
  // Get auth token
  const token = authStorage.getToken();
  
  if (!token || token.trim() === '') {
    throw new Error("Authentication token is missing. Please login again.");
  }
  
  console.log('📱 Mobile Upload - Starting:', {
    url,
    hasToken: !!token,
    tokenLength: token.length
  });
  
  // CRITICAL: Do NOT extract from FormData before first attempt
  // Using formData.get() consumes it on some mobile browsers
  // We'll use the original formData for the first attempt
  // Only extract for retries if needed
  
  // Store references for retries (but don't extract yet)
  let file: File | null = null;
  let classObj: string = '';
  let fileName: string | null = null;
  let extracted = false; // Track if we've extracted (for retries)
  
  // Helper to extract data from FormData (only call when needed for retries)
  const extractFormData = () => {
    if (extracted) return; // Already extracted
    
    try {
      // Extract file from FormData
      const fileEntry = formData.get("file");
      if (fileEntry instanceof File) {
        file = fileEntry;
        console.log('✅ File extracted for retry:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
      } else {
        throw new Error("FormData file is missing or invalid");
      }
      
      // Extract class_obj
      const classEntry = formData.get("class_obj");
      if (classEntry) {
        classObj = String(classEntry).trim();
        console.log('✅ Class extracted for retry:', classObj);
      } else {
        throw new Error("FormData class_obj is missing");
      }
      
      // Extract file_name if present
      const fileNameEntry = formData.get("file_name");
      if (fileNameEntry) {
        fileName = String(fileNameEntry).trim();
        console.log('✅ File name extracted for retry:', fileName);
      }
      
      extracted = true;
    } catch (extractError: any) {
      console.error('🔴 Failed to extract FormData:', extractError);
      throw new Error(`Failed to prepare retry: ${extractError.message}`);
    }
  };
  
  // Helper to create fresh FormData (only for retries)
  const createFreshFormData = () => {
    if (!extracted) {
      extractFormData(); // Extract first if not done
    }
    
    const fd = new FormData();
    fd.append("file", file!, file!.name);
    fd.append("class_obj", classObj);
    if (fileName) {
      fd.append("file_name", fileName);
    }
    return fd;
  };
  
  // Create headers - ONLY Authorization, NO Content-Type
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`
  };
  // DO NOT set Content-Type - browser MUST set it with boundary for multipart/form-data
  
  // Retry configuration - increased for mobile network instability
  const maxRetries = 3; // Increased to 3 for better reliability
  let lastError: any = null;
  let currentFormData = formData; // Start with original FormData
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1500 * attempt; // 1.5s, 3s, 4.5s
        console.log(`🔄 Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // CRITICAL: Only recreate FormData for retries
        // This preserves the original FormData for the first attempt
        currentFormData = createFreshFormData();
        console.log('✅ Fresh FormData created for retry');
      }
      
      // Increased timeout for mobile (10 minutes) - mobile networks can be very slow
      const controller = new AbortController();
      const timeoutMs = 600000; // 10 minutes for mobile
      const timeoutId = setTimeout(() => {
        console.log('⏱️ Upload timeout after 10 minutes');
        controller.abort();
      }, timeoutMs);
      
      // Log attempt info (without consuming FormData)
      const formDataInfo = {
        hasFile: currentFormData.has("file"),
        hasClass: currentFormData.has("class_obj"),
        hasFileName: currentFormData.has("file_name")
      };
      
      console.log('📤 Sending request...', {
        attempt: attempt + 1,
        ...formDataInfo
      });
      
      // Mobile-optimized fetch configuration
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: headers,
        body: currentFormData, // Use current FormData (original on first attempt, fresh on retries)
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store', // Aggressive cache control for mobile
        credentials: 'omit',
        // Note: keepalive removed - not well supported and can cause issues
      };
      
      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);
      
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        // Parse error response
        let errorMessage = `Upload failed (${response.status})`;
        let errorData: any = null;
        
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
              
              // Handle nested error messages
              if (errorData.errors) {
                if (typeof errorData.errors === 'object') {
                  const errorMessages = Object.entries(errorData.errors).map(([key, value]) => {
                    if (Array.isArray(value)) {
                      return `${key}: ${value.join(', ')}`;
                    }
                    return `${key}: ${value}`;
                  });
                  errorMessage = errorMessages.join('; ') || errorMessage;
                }
              }
            } catch {
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('🔴 Failed to parse error:', parseError);
        }
        
        const error: any = new Error(errorMessage);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData || { message: errorMessage }
        };
        error.status = response.status;
        
        // Don't retry on client errors (4xx) - these are permanent
        if (response.status >= 400 && response.status < 500) {
          console.log('❌ Client error (4xx) - not retrying');
          throw error;
        }
        
        // Retry on server errors (5xx)
        throw error;
      }
      
      // Parse success response
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        }
      } catch (parseError) {
        console.error('🔴 Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      console.log('✅ Upload successful!', data);
      return data;
      
    } catch (error: any) {
      lastError = error;
      
      const errorInfo = {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code
      };
      
      console.error(`🔴 Attempt ${attempt + 1} failed:`, errorInfo);
      
      // Determine if we should retry
      const isNetworkError = 
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('Network request failed') ||
        error.message?.includes('Load failed') ||
        error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message?.includes('ERR_NETWORK_CHANGED') ||
        (!error.response && !error.status);
      
      const isServerError = error.status >= 500;
      const isClientError = error.status >= 400 && error.status < 500;
      
      // Don't retry on client errors (4xx) - these are permanent
      if (isClientError) {
        console.log('❌ Client error (4xx) - not retrying');
        throw error;
      }
      
      // Retry on network errors or server errors
      if ((isNetworkError || isServerError) && attempt < maxRetries) {
        console.log(`⚠️ Will retry (${attempt + 1}/${maxRetries})`);
        continue;
      }
      
      // Max retries reached or non-retryable error
      console.error('❌ Upload failed permanently after all retries');
      throw error;
    }
  }
  
  throw lastError || new Error('Upload failed after all retries');
};

export default uploadService;
