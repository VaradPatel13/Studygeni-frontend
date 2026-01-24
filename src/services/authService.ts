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
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        if (response.data.token) {
            Cookies.set('token', response.data.token, { expires: 7 }); // Expires in 7 days
            localStorage.setItem('user', JSON.stringify(response.data.user)); // Store minimal user data
        }
        return response.data;
    },

    async register(credentials: RegisterCredentials) {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        if (response.data.token) {
            Cookies.set('token', response.data.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(response.data.user));
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

    logout() {
        Cookies.remove('token');
        localStorage.removeItem('user');
    }
};
