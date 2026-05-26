import axios from 'axios';
import api from '@/lib/api';

export const aiService = {
    async generateFlashcards(documentId: string, count: number = 10) {
        const response = await api.post(`/ai/flashcards/${documentId}`, { count });
        return response.data;
    },

    async generateQuiz(documentId: string, count: number = 5, difficulty: string = 'mixed') {
        try {
            const response = await api.post(
                `/ai/quiz/${documentId}`,
                { count, difficulty },
                { headers: { 'x-skip-global-error': 'true' } }
            );
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                return {
                    featureUnavailable: true,
                    redirectToBilling: true,
                };
            }

            throw error;
        }
    },

    async generateSummary(documentId: string, length: string = 'medium') {
        const response = await api.post(`/ai/summary/${documentId}`, { length });
        return response.data;
    },

    async chatWithDocument(documentId: string, message: string) {
        const response = await api.post(`/ai/chat/${documentId}`, { message });
        return response.data;
    },

    async explainConcept(documentId: string, concept: string, level: string = 'simple') {
        const response = await api.post(`/ai/explain/${documentId}`, { concept, level });
        return response.data;
    },

    async getChatHistory(documentId: string) {
        const response = await api.get(`/ai/chat-history/${documentId}`);
        return response.data;
    },

    async generateYoutubeSummary(videoUrl: string, length: string = 'medium') {
        const response = await api.post('/ai/youtube-summary', { videoUrl, length });
        return response.data;
    },

    async generateTextSummary(text: string, length: string = 'medium') {
        const response = await api.post('/ai/text-summary', { text, length });
        return response.data;
    }
};
