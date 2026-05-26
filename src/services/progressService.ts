import axios from 'axios';
import api from '@/lib/api';

type ProgressStatsPayload = {
    stats: {
        flashcards: { totalSets: number; totalCards: number; reviewedCount: number; starredCount: number };
        quizzes: { taken: number; avgScore: number; totalQuestionsAnswered: number };
    };
    recentData: {
        documents: unknown[];
        quizzes: unknown[];
    };
    recentActivity: unknown[];
};

type ProgressStatsResponse = ProgressStatsPayload & {
    data: ProgressStatsPayload;
    featureUnavailable: boolean;
};

const emptyProgressPayload: ProgressStatsPayload = {
    stats: {
        flashcards: { totalSets: 0, totalCards: 0, reviewedCount: 0, starredCount: 0 },
        quizzes: { taken: 0, avgScore: 0, totalQuestionsAnswered: 0 },
    },
    recentData: {
        documents: [],
        quizzes: [],
    },
    recentActivity: [],
};

export const progressService = {
    async getStats(): Promise<ProgressStatsResponse> {
        try {
            const response = await api.get('/progress/stats', {
                headers: { 'x-skip-global-error': 'true' }
            });
            const payload = (response.data?.data || response.data) as ProgressStatsPayload;
            return {
                data: payload,
                ...payload,
                featureUnavailable: false,
            };
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                const payload = emptyProgressPayload;
                return {
                    data: payload,
                    ...payload,
                    featureUnavailable: true,
                };
            }

            throw error;
        }
    }
};
