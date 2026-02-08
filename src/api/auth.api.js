import api from './axios';
import { ENDPOINTS } from '../utils/constants';
import { demoLogin, demoGetCurrentUser } from './demo';

// Mode démo activé (pas de backend)
const DEMO_MODE = true;

/**
 * Connexion utilisateur
 */
export async function login(email, password) {
    if (DEMO_MODE) {
        return demoLogin(email, password);
    }
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
}

/**
 * Déconnexion
 */
export async function logout() {
    if (DEMO_MODE) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        return;
    }
    try {
        await api.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    }
}

/**
 * Récupérer l'utilisateur courant
 */
export async function getCurrentUser() {
    if (DEMO_MODE) {
        return demoGetCurrentUser();
    }
    const response = await api.get(ENDPOINTS.AUTH.ME);
    return response.data;
}

/**
 * Rafraîchir le token
 */
export async function refreshToken(token) {
    if (DEMO_MODE) {
        return { token: 'demo_refreshed_token_' + Date.now() };
    }
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken: token });
    return response.data;
}
