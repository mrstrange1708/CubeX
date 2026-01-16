import api from '@/lib/api';
import { CubeState } from '@/components/solver/CubeNet';

export interface Phase {
    name: string;
    moves: string[];
}

export interface SolveResponse {
    valid: boolean;
    solution: string;
    phases: Phase[];
    message?: string;
    error?: string;
}

export const cubeApi = {
    solveCube: async (cubeState: CubeState): Promise<SolveResponse> => {
        try {
            const response = await api.post<SolveResponse>('/solve', cubeState);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Failed to connect to the solver service' };
        }
    },
    scrambleCube: async (): Promise<{ stickers: CubeState, sequence: string[] }> => {
        try {
            const response = await api.get('/scramble');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Failed to get scramble' };
        }
    }
};
