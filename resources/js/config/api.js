const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    BASE_URL: API_BASE_URL,
    API_V1: `${API_BASE_URL}/api/v1`
};

export const createApiUrl = (endpoint) => {
    return `${API_ENDPOINTS.API_V1}${endpoint}`;
};

export const createStorageUrl = (path) => {
    return `${API_BASE_URL}/storage/${path}`;
};