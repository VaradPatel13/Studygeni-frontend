import api from '@/lib/api';

export const flashcardService = {
    async generateFlashcards(documentId: string, options?: any) {
        const response = await api.post(`/flashcards/generate/${documentId}`, options);
        return response.data;
    },

    async getFlashcardsByDocument(documentId: string) {
        const response = await api.get(`/flashcards/document/${documentId}`);
        return response.data;
    },

    async getAllFlashcardSets() {
        const response = await api.get('/flashcards');
        return response.data;
    },

    async reviewCard(setId: string, cardId: string, data: any) {
        const response = await api.patch(`/flashcards/${setId}/review/${cardId}`, data);
        return response.data;
    },

    async toggleStar(setId: string, cardId: string) {
        const response = await api.patch(`/flashcards/${setId}/star/${cardId}`);
        return response.data;
    }
};
