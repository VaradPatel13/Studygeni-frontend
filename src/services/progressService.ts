import api from '@/lib/api';

export const progressService = {
    async getStats() {
        const response = await api.get('/progress/stats');
        // Return the nested data object which contains stats, recentActivity, and recentData
        return response.data?.data || response.data;
    }
};
