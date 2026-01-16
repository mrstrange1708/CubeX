import api from '@/lib/api';

export interface LeaderboardUser {
    id: string;
    username: string;
    avatar: string | null;
    bestSolve: number;
    totalSolves: number;
}

export interface UserRankData {
    rank: number;
    totalPlayers: number;
    percentile: number;
    bestSolve: number | null;
}

export const leaderboardApi = {
    getGlobalLeaderboard: async (limit: number = 100): Promise<LeaderboardUser[]> => {
        const response = await api.get<LeaderboardUser[]>(`/leaderboard/global?limit=${limit}`);
        return response.data;
    },
    getUserRank: async (userId: string): Promise<UserRankData> => {
        const response = await api.get<UserRankData>(`/leaderboard/percentile/${userId}`);
        return response.data;
    }
};
