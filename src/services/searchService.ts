import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export interface SearchUser {
  id: string | number;
  type: 'user';
  full_name: string;
  email: string;
  user_type: 'student' | 'lecturer';
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface SearchFile {
  id: string;
  type: 'file';
  file_code: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  is_own?: boolean;
}

export interface SearchClass {
  id: string;
  type: 'class';
  name: string;
  class_code: string;
  description?: string;
  is_verified?: boolean;
  member_count: number;
  creator_name?: string;
}

export interface SearchFriend {
  id: string | number;
  type: 'friend';
  full_name: string;
  email: string;
  user_type: 'student' | 'lecturer';
  nickname?: string;
  status?: 'pending' | 'accepted';
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface SearchLibraryItem {
  id: string;
  type: 'library';
  item_code: string;
  title: string;
  description?: string;
  file_type?: string;
  subject?: string;
  course_code?: string;
  author_name?: string;
  category_name?: string;
  is_featured?: boolean;
  view_count?: number;
  download_count?: number;
}

// Autocomplete suggestion from GET /api/v1/search/suggestions/
export interface SearchSuggestion {
  type: 'user' | 'class' | 'library';
  label: string;
  sub: string;
}

export interface SearchResults {
  users?: SearchUser[];
  files?: SearchFile[];
  classes?: SearchClass[];
  friends?: SearchFriend[];
  library?: SearchLibraryItem[];
}

const normalizeUser = <T extends SearchUser | SearchFriend>(user: T): T => {
  const profileImageUrl = resolveMediaUrl(user.profile_image_url || user.profile_image || null);
  return { ...user, profile_image: profileImageUrl, profile_image_url: profileImageUrl };
};

const empty: SearchResults = { users: [], files: [], classes: [], friends: [], library: [] };

const unwrapSearchResponse = (payload: any): SearchResults => {
  if (!payload || typeof payload !== 'object') return empty;

  // API response: { success, data: { query, total_results, results: { users, classes, ... }, counts } }
  const outer = 'data' in payload ? payload.data : payload;
  if (!outer || typeof outer !== 'object') return empty;

  // New format: outer.results holds the per-category arrays
  const cats = outer.results && typeof outer.results === 'object'
    ? outer.results
    : outer; // fallback: outer itself is { users, classes, ... }

  return {
    users: Array.isArray(cats.users) ? cats.users.map(normalizeUser) : [],
    files: Array.isArray(cats.files) ? cats.files : [],
    classes: Array.isArray(cats.classes) ? cats.classes : [],
    friends: Array.isArray(cats.friends) ? cats.friends.map(normalizeUser) : [],
    library: Array.isArray(cats.library) ? cats.library : [],
  };
};

const searchService = {
  // Full search — 5 categories, saves history
  // GET /api/v1/search/?q=...&limit=8&categories=users,classes,...
  search: async (params: {
    q: string;
    limit?: number;
    categories?: string[];
  }): Promise<SearchResults> => {
    if (!params.q || params.q.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    const queryParams: Record<string, string | number> = { q: params.q.trim() };
    if (params.limit !== undefined) queryParams.limit = Math.min(Math.max(params.limit, 1), 50);
    if (params.categories?.length) queryParams.categories = params.categories.join(',');

    const response = await api.get('/v1/search/', { params: queryParams });
    return unwrapSearchResponse(response.data);
  },

  // Autocomplete — no history written, min 1 char, debounce ~250 ms
  // GET /api/v1/search/suggestions/?q=...
  getSuggestions: async (q: string): Promise<SearchSuggestion[]> => {
    if (!q || q.trim().length < 1) return [];
    try {
      const response = await api.get('/v1/search/suggestions/', { params: { q: q.trim(), limit: 6 } });
      const raw = response.data;
      // API: { success, data: [ { type, label, sub }, ... ] }
      const data = raw?.data ?? raw;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Recent searches — 20 most recent
  // GET /api/v1/search/history/
  getHistory: async (): Promise<string[]> => {
    try {
      const response = await api.get('/v1/search/history/');
      const raw = response.data;
      // API: { success, data: [ { id, query, result_count, categories_searched, created_at }, ... ] }
      const data = raw?.data ?? raw;
      const items: any[] = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      return items.map((i) => i.query ?? i).filter(Boolean);
    } catch {
      return [];
    }
  },

  // Clear all search history for the caller
  // DELETE /api/v1/search/history/
  clearHistory: async (): Promise<void> => {
    await api.delete('/v1/search/history/');
  },
};

export default searchService;
