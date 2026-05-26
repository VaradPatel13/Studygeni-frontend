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

// Helper to sanitize Axios and generic errors for UI display
export const cleanErrorMessage = (error: unknown, fallback: string = 'An unexpected error occurred'): string => {
    if (axios.isAxiosError(error)) {
        const serverMsg = error.response?.data?.message || error.response?.data?.error;
        if (serverMsg && typeof serverMsg === 'string' && !serverMsg.includes('status code') && !serverMsg.includes('Request failed')) {
            return serverMsg;
        }
    }
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('status code') || msg.includes('Request failed') || msg.includes('Network Error')) {
        return fallback;
    }
    return msg;
};

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Request Cancellation
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const rawMessage = error.response?.data?.message || 'An unexpected error occurred';
        const errorMessage = cleanErrorMessage(error, rawMessage);

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
            const requestConfig = error.config as
                | { skipGlobalError?: boolean; headers?: Record<string, unknown> }
                | undefined;
            const skipGlobalError =
                requestConfig?.skipGlobalError || requestConfig?.headers?.['x-skip-global-error'] === 'true';

            if (!skipGlobalError && typeof window !== 'undefined') {
                if (status === 403) {
                    const code = error.response?.data?.code;
                    if (code === 'FORBIDDEN') {
                        toast.error(errorMessage || 'Feature not available on your current plan.');
                        return Promise.reject(error);
                    }
                    toast.error('Access Denied: You do not have permission.');
                } else if (status === 429) {
                    toast.error('Too many requests. Please try again later.');
                } else if (status >= 500) {
                    toast.error('Server error. Please try again later.');
                }
                // Note: status 400 (Bad Request) and 404 (Not Found) are handled locally 
                // by the calling components' catch blocks to avoid duplicate toasts.
            }
        }

        return Promise.reject(error);
    }
);

export default api;
