import api from '@/lib/api';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface FriendshipData {
  id: number;
  user: UserInfo;
  friend: UserInfo;
  nickname: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface FriendsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FriendshipData[];
  };
}

export interface UserSearchResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: UserInfo[];
  };
}

const friendService = {
  listFriends: async () => {
    const response = await api.get<FriendsListResponse>('/friends/');
    return response.data;
  },

  listPendingRequests: async () => {
    const response = await api.get<FriendsListResponse>('/friends/pending/');
    return response.data;
  },

  sendFriendRequest: async (userId: number) => {
    const response = await api.post('/friends/', { friend: userId });
    return response.data;
  },

  acceptFriendRequest: async (friendshipId: number) => {
    const response = await api.post(`/friends/${friendshipId}/accept/`);
    return response.data;
  },

  rejectFriendRequest: async (friendshipId: number) => {
    const response = await api.post(`/friends/${friendshipId}/reject/`);
    return response.data;
  },

  removeFriend: async (friendshipId: number) => {
    const response = await api.delete(`/friends/${friendshipId}/`);
    return response.data;
  },

  updateNickname: async (friendshipId: number, nickname: string) => {
    const response = await api.patch(`/friends/${friendshipId}/`, { nickname });
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get<UserSearchResponse>('/users/search/', {
      params: { q: query },
    });
    return response.data;
  },
};

export default friendService;
