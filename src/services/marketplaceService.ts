import api from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MarketplaceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  listing_count: number;
  created_at: string;
  updated_at: string;
}

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'active' | 'inactive' | 'sold_out' | 'archived';
export type OrderStatus = 'completed' | 'cancelled';

export interface ListingSeller {
  id: string | number;
  full_name?: string;
  email?: string;
  profile_image_url?: string | null;
}

export interface Listing {
  id: string | number;
  listing_code: string;
  title: string;
  description: string;
  price: string;
  quantity: number;
  sold_quantity: number;
  available_quantity: number;
  condition: ListingCondition;
  status: ListingStatus;
  image?: string | null;
  image_url?: string | null;
  location?: string;
  category: number;
  category_name?: string;
  category_slug?: string;
  seller: ListingSeller | string | number;
  created_at: string;
  updated_at: string;
}

export interface ListingOrder {
  id: string | number;
  listing: Listing | string | number;
  buyer: ListingSeller | string | number;
  seller: ListingSeller | string | number;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  price: string;
  quantity: number;
  condition: ListingCondition;
  image?: File | null;
  location?: string;
  category: number;
}

const extractData = <T>(response: { data: any }): T => {
  const body = response.data;
  if (body && 'data' in body) return body.data as T;
  return body as T;
};

// ── Service ──────────────────────────────────────────────────────────────────

const marketplaceService = {
  // Categories
  getCategories: async (): Promise<MarketplaceCategory[]> => {
    const res = await api.get('/v1/marketplace/categories/');
    const data = extractData<MarketplaceCategory[] | { results: MarketplaceCategory[] }>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  getCategory: async (slug: string): Promise<MarketplaceCategory> => {
    const res = await api.get(`/v1/marketplace/categories/${slug}/`);
    return extractData<MarketplaceCategory>(res);
  },

  // Listings
  getListings: async (params?: {
    category?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
  }): Promise<Listing[]> => {
    const res = await api.get('/v1/marketplace/listings/', { params });
    const data = extractData<Listing[] | { results: Listing[] }>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  searchListings: async (q: string): Promise<Listing[]> => {
    const res = await api.get('/v1/marketplace/listings/search/', { params: { q } });
    const data = extractData<Listing[] | { results: Listing[] }>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  getMyListings: async (): Promise<Listing[]> => {
    const res = await api.get('/v1/marketplace/listings/me/');
    const data = extractData<Listing[] | { results: Listing[] }>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  getListing: async (listingCode: string): Promise<Listing> => {
    const res = await api.get(`/v1/marketplace/listings/${listingCode}/`);
    return extractData<Listing>(res);
  },

  createListing: async (payload: CreateListingPayload): Promise<Listing> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('description', payload.description);
    form.append('price', payload.price);
    form.append('quantity', String(payload.quantity));
    form.append('condition', payload.condition);
    form.append('category', String(payload.category));
    if (payload.location) form.append('location', payload.location);
    if (payload.image) form.append('image', payload.image);

    const res = await api.post('/v1/marketplace/listings/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<Listing>(res);
  },

  updateListing: async (listingCode: string, payload: Partial<CreateListingPayload>): Promise<Listing> => {
    const form = new FormData();
    if (payload.title !== undefined) form.append('title', payload.title);
    if (payload.description !== undefined) form.append('description', payload.description);
    if (payload.price !== undefined) form.append('price', payload.price);
    if (payload.quantity !== undefined) form.append('quantity', String(payload.quantity));
    if (payload.condition !== undefined) form.append('condition', payload.condition);
    if (payload.category !== undefined) form.append('category', String(payload.category));
    if (payload.location !== undefined) form.append('location', payload.location);
    if (payload.image) form.append('image', payload.image);

    const res = await api.patch(`/v1/marketplace/listings/${listingCode}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData<Listing>(res);
  },

  deleteListing: async (listingCode: string): Promise<void> => {
    await api.delete(`/v1/marketplace/listings/${listingCode}/`);
  },

  purchaseListing: async (listingCode: string, quantity: number): Promise<ListingOrder> => {
    const res = await api.post(`/v1/marketplace/listings/${listingCode}/purchase/`, { quantity });
    return extractData<ListingOrder>(res);
  },

  // Orders
  getOrders: async (type?: 'purchases' | 'sales'): Promise<ListingOrder[]> => {
    const params = type ? { type } : undefined;
    const res = await api.get('/v1/marketplace/orders/', { params });
    const data = extractData<ListingOrder[] | { results: ListingOrder[] }>(res);
    return Array.isArray(data) ? data : (data as any).results ?? [];
  },

  getOrder: async (id: string | number): Promise<ListingOrder> => {
    const res = await api.get(`/v1/marketplace/orders/${id}/`);
    return extractData<ListingOrder>(res);
  },
};

export default marketplaceService;
