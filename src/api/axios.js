import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Créer une instance Axios configurée
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si le token est expiré (401) et qu'on n'a pas déjà essayé de rafraîchir
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { token } = response.data;
                    localStorage.setItem('auth_token', token);

                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Échec du rafraîchissement, déconnecter l'utilisateur
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Formater le message d'erreur
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            'Une erreur est survenue';

        return Promise.reject({
            ...error,
            message: errorMessage,
            status: error.response?.status
        });
    }
);

export default api;
