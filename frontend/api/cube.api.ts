import axios from 'axios';
import { CubeState } from '@/components/solver/CubeNet';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7777';

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
            const response = await axios.post<SolveResponse>(`${API_BASE_URL}/solve`, cubeState);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Failed to connect to the solver service' };
        }
    }
};
