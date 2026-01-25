import api from '@/lib/api';

export interface Document {
    _id: string;
    title: string;
    description?: string;
    subject?: string;
    fileUrl: string;
    createdAt: string;
    [key: string]: any;
}

export const documentService = {
    async uploadDocument(formData: FormData) {
        const response = await api.post<Document>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async getAllDocuments() {
        const response = await api.get<any>('/documents');
        // Handle nested response structure: response.data.data.documents
        return response.data?.data?.documents || response.data?.data || response.data || [];
    },

    async getDocumentById(id: string) {
        const response = await api.get<any>(`/documents/${id}`);
        // Handle nested response structure: response.data.data
        return response.data?.data || response.data;
    },

    async deleteDocument(id: string) {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },

    async updateDocument(id: string, data: Partial<Document>) {
        const response = await api.put<Document>(`/documents/${id}`, data);
        return response.data;
    },
};
