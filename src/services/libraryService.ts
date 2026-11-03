import api from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LibraryCategory {
  name: string;
  slug: string;
}

export interface LibraryItemUploader {
  id: number | string;
  name: string;
  email: string;
}

export interface LibraryItem {
  code: string;
  title: string;
  description?: string;
  category: LibraryCategory;
  file_url: string;
  thumbnail_url?: string;
  download_url: string;
  file_type?: string;
  subject?: string;
  course_code?: string;
  author_name?: string;
  tags?: string[];
  uploader: LibraryItemUploader;
  created_at: string;
}

export interface CreateLibraryItemPayload {
  title: string;
  description?: string;
  category: string; // slug
  file: File;
  file_type?: string;
  subject?: string;
  course_code?: string;
  author_name?: string;
  cover_image?: File;
  tags?: string[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const extractData = <T>(response: { data: any }): T => {
  const body = response.data;
  // If the backend wraps in { success: true, data: ... }
  if (body && body.success !== undefined && 'data' in body) {
    return body.data as T;
  }
  // Fallback to direct body if no envelope
  return body as T;
};

// ── Service ──────────────────────────────────────────────────────────────────

const libraryService = {
  // Categories
  getCategories: async (): Promise<LibraryCategory[]> => {
    const res = await api.get('/v1/library/categories/');
    const data = extractData<LibraryCategory[] | PaginatedResponse<LibraryCategory>>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  // Items
  getItems: async (params?: {
    category?: string; // slug
    q?: string;
    page?: number;
  }): Promise<{ items: LibraryItem[], next: boolean }> => {
    const res = await api.get('/v1/library/items/', { params });
    const data = extractData<LibraryItem[] | PaginatedResponse<LibraryItem>>(res);
    if (Array.isArray(data)) {
      return { items: data, next: false };
    }
    return { items: data.results ?? [], next: !!data.next };
  },

  getItem: async (code: string): Promise<LibraryItem> => {
    const res = await api.get(`/v1/library/items/${code}/`);
    return extractData<LibraryItem>(res);
  },

  createItem: async (payload: CreateLibraryItemPayload): Promise<LibraryItem> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('category', payload.category);
    
    // Explicitly add type to file if available
    form.append('file', payload.file);

    if (payload.description) form.append('description', payload.description);
    if (payload.file_type) form.append('file_type', payload.file_type);
    if (payload.subject) form.append('subject', payload.subject);
    if (payload.course_code) form.append('course_code', payload.course_code);
    if (payload.author_name) form.append('author_name', payload.author_name);
    
    if (payload.cover_image) {
      form.append('cover_image', payload.cover_image);
    }
    
    if (payload.tags && payload.tags.length > 0) {
      // Tags might need to be sent as multiple fields or JSON string depending on backend.
      // Usually DRF handles multiple fields for list:
      payload.tags.forEach(tag => form.append('tags', tag));
    }

    const res = await api.post('/v1/library/items/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<LibraryItem>(res);
  },

  updateItem: async (code: string, payload: Partial<CreateLibraryItemPayload>): Promise<LibraryItem> => {
    const form = new FormData();
    if (payload.title) form.append('title', payload.title);
    if (payload.category) form.append('category', payload.category);
    if (payload.description !== undefined) form.append('description', payload.description);
    if (payload.file_type) form.append('file_type', payload.file_type);
    if (payload.subject) form.append('subject', payload.subject);
    if (payload.course_code) form.append('course_code', payload.course_code);
    if (payload.author_name) form.append('author_name', payload.author_name);
    if (payload.file) form.append('file', payload.file);
    if (payload.cover_image) form.append('cover_image', payload.cover_image);

    const res = await api.patch(`/v1/library/items/${code}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<LibraryItem>(res);
  },

  deleteItem: async (code: string): Promise<void> => {
    await api.delete(`/v1/library/items/${code}/`);
  },

  downloadItemUrl: (code: string): string => {
    // Generate the download URL dynamically
    const baseURL = api.defaults.baseURL || '';
    return `${baseURL.replace(/\/$/, '')}/v1/library/items/${code}/download/`;
  },
};

export default libraryService;
