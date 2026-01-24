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
        const response = await api.get<Document[]>('/documents');
        return response.data;
    },

    async getDocumentById(id: string) {
        const response = await api.get<Document>(`/documents/${id}`);
        return response.data;
    },
};
