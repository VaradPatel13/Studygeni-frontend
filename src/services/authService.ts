import api from '@/lib/api';
import Cookies from 'js-cookie';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    mobileNumber: string;
    profileImage?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        [key: string]: any;
    };
}

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.post<any>('/auth/login', credentials);
        const { token, user } = response.data.data;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    async register(credentials: RegisterCredentials) {
        const response = await api.post<any>('/auth/register', credentials);
        const { token, user } = response.data.data;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    async getProfile() {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    async updateProfile(data: any) {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    async changePassword(data: any) {
        const response = await api.put('/auth/change-password', data);
        return response.data;
    },

    logout() {
        Cookies.remove('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
