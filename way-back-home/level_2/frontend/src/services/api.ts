import axios from 'axios';

// Use relative path to leverage Vite proxy in development
// This avoids CORS issues and ensures requests go through the dev server
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 2 minute timeout
});

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Request interceptor for loading states
api.interceptors.request.use(
    (config) => {
        // Add auth token if needed in the future
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);

        // Handle specific error codes
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Handle unauthorized
                console.error('Unauthorized access');
            } else if (status === 404) {
                console.error('Resource not found');
            } else if (status === 500) {
                console.error('Server error');
            }

            return Promise.reject(data || error);
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server');
            return Promise.reject({ message: 'Network error: No response from server' });
        } else {
            // Something else happened
            return Promise.reject({ message: error.message });
        }
    }
);
