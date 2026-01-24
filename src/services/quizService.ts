import api from '@/lib/api';

export const quizService = {
    async getQuizzesByDocument(documentId: string) {
        const response = await api.get(`/quizzes/document/${documentId}`);
        return response.data;
    },

    async getQuizById(quizId: string) {
        const response = await api.get(`/quizzes/${quizId}`);
        return response.data;
    },

    async submitQuiz(quizId: string, answers: any[]) {
        const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
        return response.data;
    },

    async getQuizResult(quizId: string) {
        const response = await api.get(`/quizzes/${quizId}/result`);
        return response.data;
    }
};
