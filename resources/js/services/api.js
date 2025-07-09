import axios from 'axios';

// Configuration de base d'Axios
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Ajouter le token CSRF pour Laravel
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Services API
export const authAPI = {
    login: (credentials) => api.post('/login', credentials),
    register: (userData) => api.post('/register', userData),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.resolve();
    },
    getCurrentUser: () => api.get('/user'),
};

export const announcementsAPI = {
    getAll: (params = {}) => api.get('/announcements', { params }),
    getById: (id) => api.get(`/announcements/${id}`),
    create: (data) => api.post('/announcements', data),
    update: (id, data) => api.put(`/announcements/${id}`, data),
    delete: (id) => api.delete(`/announcements/${id}`),
    search: (query) => api.get('/announcements/search', { params: { q: query } }),
};

export const meetingsAPI = {
    getAll: (params = {}) => api.get('/meetings', { params }),
    getById: (id) => api.get(`/meetings/${id}`),
    create: (data) => api.post('/meetings', data),
    update: (id, data) => api.put(`/meetings/${id}`, data),
    delete: (id) => api.delete(`/meetings/${id}`),
    join: (id) => api.post(`/meetings/${id}/join`),
    leave: (id) => api.post(`/meetings/${id}/leave`),
};

export const universitiesAPI = {
    getAll: () => api.get('/universities'),
    getById: (id) => api.get(`/universities/${id}`),
    getStudents: (id, params = {}) => api.get(`/universities/${id}/students`, { params }),
    getAnnouncements: (id, params = {}) => api.get(`/universities/${id}/announcements`, { params }),
    getEvents: (id, params = {}) => api.get(`/universities/${id}/events`, { params }),
};

export const usersAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

// Utilitaires pour la gestion du token et de l'utilisateur
export const auth = {
    setToken: (token) => {
        localStorage.setItem('token', token);
    },
    getToken: () => {
        return localStorage.getItem('token');
    },
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    clear: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export default api;