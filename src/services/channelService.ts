import api from '@/lib/api';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://api.kibegi.com/api';

export interface ChannelProfile {
  id: number;
  class_obj: string;
  class_name: string;
  class_code: string;
  public_token: string;
  public_registration_enabled: boolean;
  default_sender_name: string;
  registration_hint: string;
  contact_count: number;
  broadcast_count: number;
  registration_urls: {
    public_token: string;
    public_info_url: string;
    public_register_url: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelWallet {
  id: number;
  class_obj: string;
  class_name: string;
  balance_credits: number;
  provider_name: string;
  sender_id: string;
  is_active: boolean;
  last_topup_reference: string;
  last_topup_at: string | null;
  contact_count: number;
  broadcast_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelContact {
  id: string;
  class_obj: string;
  class_name: string;
  full_name: string;
  phone_number: string;
  consent_granted: boolean;
  consent_source: 'manual' | 'public' | 'imported';
  notes: string;
  is_active: boolean;
  registered_by: number | null;
  registered_by_name: string | null;
  created_by: number | null;
  added_by_name: string | null;
  added_by_email: string | null;
  verified_at: string | null;
  user_profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelBroadcast {
  id: string;
  class_obj: string;
  class_name: string;
  sender: number | null;
  sender_name: string | null;
  sender_email: string | null;
  subject: string;
  message: string;
  venue: string;
  status: 'draft' | 'sending' | 'sent' | 'partial' | 'failed';
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  credits_used: number;
  delivery_count: number;
  delivery_summary: { sent: number; failed: number; skipped: number };
  recent_deliveries: any[];
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicRegistrationInfo {
  class_id: string;
  class_name: string;
  class_code: string;
  description: string;
  registration_hint: string;
  public_registration_enabled: boolean;
  default_sender_name: string;
  credits_remaining: number;
  contacts_registered: number;
  registration_urls: {
    public_token: string;
    public_info_url: string;
    public_register_url: string;
  };
}

const unwrap = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data as T;
  return payload as T;
};

const unwrapList = <T>(payload: any): { results: T[]; count: number; next: boolean } => {
  const raw = payload && 'data' in payload ? payload.data : payload;
  const results: T[] = raw?.results ?? (Array.isArray(raw) ? raw : []);
  return { results, count: raw?.count ?? results.length, next: !!raw?.next };
};

const channelService = {
  getProfile: async (classId: string): Promise<ChannelProfile> => {
    const res = await api.get(`/v1/class-comms/classes/${classId}/profile/`);
    return unwrap<ChannelProfile>(res.data);
  },

  updateProfile: async (classId: string, data: Partial<Pick<ChannelProfile, 'public_registration_enabled' | 'default_sender_name' | 'registration_hint'>>): Promise<ChannelProfile> => {
    const res = await api.patch(`/v1/class-comms/classes/${classId}/profile/`, data);
    return unwrap<ChannelProfile>(res.data);
  },

  getWallet: async (classId: string): Promise<ChannelWallet> => {
    const res = await api.get(`/v1/class-comms/classes/${classId}/wallet/`);
    return unwrap<ChannelWallet>(res.data);
  },

  getContacts: async (classId: string): Promise<{ results: ChannelContact[]; count: number; next: boolean }> => {
    const res = await api.get(`/v1/class-comms/classes/${classId}/contacts/`);
    return unwrapList<ChannelContact>(res.data);
  },

  addContact: async (classId: string, data: { full_name: string; phone_number: string; consent_granted?: boolean; notes?: string }): Promise<ChannelContact> => {
    const res = await api.post(`/v1/class-comms/classes/${classId}/contacts/`, data);
    return unwrap<ChannelContact>(res.data);
  },

  updateContact: async (contactId: string, data: Partial<Pick<ChannelContact, 'full_name' | 'phone_number' | 'notes' | 'is_active'>>): Promise<ChannelContact> => {
    const res = await api.patch(`/v1/class-comms/contacts/${contactId}/`, data);
    return unwrap<ChannelContact>(res.data);
  },

  deleteContact: async (contactId: string): Promise<void> => {
    await api.delete(`/v1/class-comms/contacts/${contactId}/`);
  },

  getBroadcasts: async (classId: string): Promise<{ results: ChannelBroadcast[]; count: number; next: boolean }> => {
    const res = await api.get(`/v1/class-comms/classes/${classId}/broadcasts/`);
    return unwrapList<ChannelBroadcast>(res.data);
  },

  sendBroadcast: async (classId: string, data: { subject?: string; message: string; venue?: string }): Promise<ChannelBroadcast> => {
    const res = await api.post(`/v1/class-comms/classes/${classId}/broadcasts/`, data);
    return unwrap<ChannelBroadcast>(res.data);
  },

  getBroadcast: async (broadcastId: string): Promise<ChannelBroadcast> => {
    const res = await api.get(`/v1/class-comms/broadcasts/${broadcastId}/`);
    return unwrap<ChannelBroadcast>(res.data);
  },

  // Public endpoints — no auth token needed
  getPublicInfo: async (token: string): Promise<PublicRegistrationInfo> => {
    const res = await axios.get(`${BASE}/v1/public/class-comms/${token}/info/`);
    return unwrap<PublicRegistrationInfo>(res.data);
  },

  publicRegister: async (token: string, data: { full_name: string; phone_number: string; consent_granted?: boolean }): Promise<ChannelContact> => {
    const res = await axios.post(`${BASE}/v1/public/class-comms/${token}/register/`, data);
    return unwrap<ChannelContact>(res.data);
  },
};

export default channelService;
