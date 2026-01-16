import api from '@/lib/api';

export interface SaveSolveData {
    userId: string;
    time: number;
    scramble: string;
}

export const solveApi = {
    saveSolve: async (data: SaveSolveData) => {
        const response = await api.post('/solve', data);
        return response.data;
    }
};
