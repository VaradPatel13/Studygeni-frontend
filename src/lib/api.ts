import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = '/api/v1';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Try to get token from cookies first, then localStorage
        let token = Cookies.get('token');
        if (!token && typeof window !== 'undefined') {
            token = localStorage.getItem('token') || undefined;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Request Cancellation
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';

        // 1. Handle Unauthorized (401)
        if (status === 401) {
            // Only toast if we haven't already redirected/cleaned up recently to avoid spam
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    toast.error('Session expired. Please login again.');
                }

                Cookies.remove('token');
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        // 2. Handle other errors globally
        else {
            // We can optionally skip global error handling for specific requests
            // by passing { skipGlobalError: true } in axios config
            // Use (error.config as any)?.skipGlobalError if checking strict types
            const skipGlobalError = (error.config as any)?.skipGlobalError;

            if (!skipGlobalError && typeof window !== 'undefined') {
                if (status === 403) {
                    toast.error('Access Denied: You do not have permission.');
                } else if (status === 404) {
                    toast.error(errorMessage || 'Resource not found');
                } else if (status === 429) {
                    toast.error('Too many requests. Please try again later.');
                } else if (status >= 500) {
                    toast.error('Server error. Please try again later.');
                } else {
                    toast.error(errorMessage);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
