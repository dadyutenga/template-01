import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export interface UserInfo {
  id: number;
  email: string;
  full_name: string;
  user_type: 'student' | 'lecturer';
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface FriendInfo {
  id: number;
  user?: number;  // ID of user who sent the request
  friend?: number;  // ID of user who received the request
  friend_info: UserInfo;
  nickname: string;
  display_name: string;
  status: 'pending' | 'accepted';
  created_at: string;
  accepted_at?: string | null;
}

export interface FriendshipDetail {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  friend: number;
  friend_email: string;
  friend_name: string;
  nickname: string;
  display_name: string;
  status: 'pending' | 'accepted';
  created_at: string;
  accepted_at?: string | null;
}

export interface FriendsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FriendInfo[];
}

export interface FriendshipResponse {
  success: boolean;
  message: string;
  data: FriendshipDetail;
}

export interface SearchUsersResponse {
  success: boolean;
  message: string;
  data: UserInfo[];
}

export interface RemoveFriendResponse {
  success: boolean;
  message: string;
}

// Request detail structure from incoming/sent endpoints
export interface FriendRequestDetail {
  id: number;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  sender_type: 'student' | 'lecturer';
  sender_profile_image?: string | null;
  sender_profile_image_url?: string | null;
  recipient_id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_type: 'student' | 'lecturer';
  recipient_profile_image?: string | null;
  recipient_profile_image_url?: string | null;
  status: 'pending' | 'accepted';
  created_at: string;
}

const normalizeUserInfo = (user: UserInfo): UserInfo => {
  const profileImageUrl = resolveMediaUrl(user.profile_image_url || user.profile_image || null);
  return {
    ...user,
    profile_image: profileImageUrl,
    profile_image_url: profileImageUrl,
  };
};

const normalizeFriendInfo = (friend: FriendInfo): FriendInfo => ({
  ...friend,
  friend_info: normalizeUserInfo(friend.friend_info),
});

const normalizeFriendRequest = (request: FriendRequestDetail): FriendRequestDetail => ({
  ...request,
  sender_profile_image: resolveMediaUrl(request.sender_profile_image_url || request.sender_profile_image || null),
  sender_profile_image_url: resolveMediaUrl(request.sender_profile_image_url || request.sender_profile_image || null),
  recipient_profile_image: resolveMediaUrl(request.recipient_profile_image_url || request.recipient_profile_image || null),
  recipient_profile_image_url: resolveMediaUrl(request.recipient_profile_image_url || request.recipient_profile_image || null),
});

export interface FriendRequestsResponse {
  success: boolean;
  message: string;
  data: FriendRequestDetail[];
}

const friendsService = {
  // Get list of friends with optional status filter
  getFriends: async (status: 'pending' | 'accepted' | 'all' = 'accepted'): Promise<FriendsListResponse> => {
    console.log('🔵 Fetching friends with status:', status);
    const response = await api.get('/v1/friends/', {
      params: { status }
    });
    console.log('🟢 Friends response:', response.data);
    // Handle both wrapped { data: {...} } and direct response
    // API might return: { data: { count, results, ... } } or directly { count, results, ... }
    const data = response.data.data || response.data;
    // Ensure it has the expected structure
    if (data && typeof data === 'object' && ('results' in data || Array.isArray(data))) {
      return {
        ...data,
        results: Array.isArray(data.results) ? data.results.map(normalizeFriendInfo) : [],
      } as FriendsListResponse;
    }
    // If it's just an array, wrap it
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data.map(normalizeFriendInfo) };
    }
    return data as FriendsListResponse;
  },

  // Send friend request
  sendFriendRequest: async (userId?: number, email?: string): Promise<FriendshipResponse> => {
    // Build request body with only defined values
    const requestBody: { user_id?: number; email?: string } = {};
    if (userId !== undefined) {
      requestBody.user_id = userId;
    }
    if (email !== undefined) {
      requestBody.email = email;
    }
    
    console.log('🔵 Sending friend request with body:', requestBody);
    
    const response = await api.post<FriendshipResponse>('/v1/friends/add/', requestBody);
    console.log('🟢 Friend request response:', response.data);
    // Handle both wrapped { data: {...} } and direct response
    return response.data.data ? { ...response.data, data: response.data.data } : response.data;
  },

  // Search for users
  searchUsers: async (query: string): Promise<SearchUsersResponse> => {
    console.log('🔵 Searching users with query:', query);
    const response = await api.get('/v1/friends/search/', {
      params: { q: query }
    });
    console.log('🟢 Search response:', response.data);
    // Handle both wrapped { data: [...] } and direct response
    // API might return: { data: [...] } or directly [...]
    const data = response.data.data || response.data;
    // If it's an array, wrap it in the expected format
    if (Array.isArray(data)) {
      return { success: true, message: 'Search completed', data: data.map(normalizeUserInfo) };
    }
    // If it's already wrapped, return as is
    return {
      ...data,
      data: Array.isArray(data?.data) ? data.data.map(normalizeUserInfo) : [],
    } as SearchUsersResponse;
  },

  // Accept friend request
  acceptFriendRequest: async (friendshipId: number): Promise<FriendshipResponse> => {
    console.log('🔵 Accepting friend request:', friendshipId);
    const response = await api.post<FriendshipResponse>(`/v1/friends/${friendshipId}/accept/`);
    console.log('🟢 Accept response:', response.data);
    return response.data;
  },


  // Update friend nickname
  updateNickname: async (friendshipId: number, nickname: string): Promise<FriendshipResponse> => {
    console.log('🔵 Updating nickname:', friendshipId, nickname);
    const response = await api.patch<FriendshipResponse>(`/v1/friends/${friendshipId}/nickname/`, {
      nickname
    });
    console.log('🟢 Nickname update response:', response.data);
    return response.data;
  },

  // Get incoming friend requests (sent TO you)
  getIncomingRequests: async (): Promise<FriendRequestsResponse> => {
    console.log('🔵 Fetching incoming friend requests');
    const response = await api.get('/v1/friends/requests/incoming/');
    console.log('🟢 Incoming requests response:', response.data);
    // API returns: { count, next, previous, results: [...] }
    const apiData = response.data;
    const results = apiData.results || apiData.data || [];
    console.log('📦 Extracted incoming results:', results);
    return {
      success: true,
      message: apiData.message || 'Incoming requests retrieved',
      data: Array.isArray(results) ? results.map(normalizeFriendRequest) : []
    };
  },

  // Get sent friend requests (sent BY you)
  getSentRequests: async (): Promise<FriendRequestsResponse> => {
    console.log('🔵 Fetching sent friend requests');
    const response = await api.get('/v1/friends/requests/sent/');
    console.log('🟢 Sent requests response:', response.data);
    // API returns: { count, next, previous, results: [...] }
    const apiData = response.data;
    const results = apiData.results || apiData.data || [];
    console.log('📦 Extracted sent results:', results);
    return {
      success: true,
      message: apiData.message || 'Sent requests retrieved',
      data: Array.isArray(results) ? results.map(normalizeFriendRequest) : []
    };
  },

  // Decline friend request (POST /decline/)
  declineFriendRequest: async (friendshipId: number): Promise<RemoveFriendResponse> => {
    console.log('🔵 Declining friend request:', friendshipId);
    try {
      const response = await api.post<RemoveFriendResponse>(`/v1/friends/${friendshipId}/decline/`);
      console.log('🟢 Decline response (POST /decline/):', response.data);
      return response.data;
    } catch (error: any) {
      // Fallback to DELETE if /decline/ doesn't exist
      if (error.response?.status === 404) {
        console.log('🟡 POST /decline/ not found, using DELETE instead');
        const response = await api.delete<RemoveFriendResponse>(`/v1/friends/${friendshipId}/`);
        console.log('🟢 Decline response (DELETE):', response.data);
        return response.data;
      }
      throw error;
    }
  },

  // Cancel sent friend request (POST /cancel/)
  cancelFriendRequest: async (friendshipId: number): Promise<RemoveFriendResponse> => {
    console.log('🔵 Canceling friend request:', friendshipId);
    try {
      const response = await api.post<RemoveFriendResponse>(`/v1/friends/${friendshipId}/cancel/`);
      console.log('🟢 Cancel response (POST /cancel/):', response.data);
      return response.data;
    } catch (error: any) {
      // Fallback to DELETE if /cancel/ doesn't exist
      if (error.response?.status === 404) {
        console.log('🟡 POST /cancel/ not found, using DELETE instead');
        const response = await api.delete<RemoveFriendResponse>(`/v1/friends/${friendshipId}/`);
        console.log('🟢 Cancel response (DELETE):', response.data);
        return response.data;
      }
      throw error;
    }
  },

  // Remove friend or cancel request
  removeFriend: async (friendshipId: number): Promise<RemoveFriendResponse> => {
    console.log('🔵 Removing friend/canceling request:', friendshipId);
    const response = await api.delete<RemoveFriendResponse>(`/v1/friends/${friendshipId}/`);
    console.log('🟢 Remove response:', response.data);
    return response.data;
  },
};

export default friendsService;
