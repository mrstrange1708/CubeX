import api from '@/lib/api';
import { Post } from './posts.api';
import { Friend } from './friends.api';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    bestSolve: number | null;
    totalSolves: number;
    createdAt: string;
    _count: {
        posts: number;
        friends: number;
    };
}

export interface UserProfileUpdate {
    username?: string;
    bio?: string;
}

export const userApi = {
    // Get user profile
    getProfile: async (userId: string): Promise<UserProfile> => {
        const response = await api.get<UserProfile>(`/users/${userId}/profile`);
        return response.data;
    },

    // Update user profile
    updateProfile: async (userId: string, data: UserProfileUpdate): Promise<UserProfile> => {
        const response = await api.put<UserProfile>(`/users/${userId}/profile`, data);
        return response.data;
    },

    // Get user's posts
    getUserPosts: async (userId: string, limit = 20, offset = 0): Promise<Post[]> => {
        const response = await api.get<Post[]>(`/users/${userId}/posts?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    // Get posts liked by user
    getLikedPosts: async (userId: string, limit = 20, offset = 0): Promise<Post[]> => {
        const response = await api.get<Post[]>(`/users/${userId}/liked?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    // Get user's friends
    getUserFriends: async (userId: string): Promise<Friend[]> => {
        const response = await api.get<Friend[]>(`/users/${userId}/friends`);
        return response.data;
    }
};
