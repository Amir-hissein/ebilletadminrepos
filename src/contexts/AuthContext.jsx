import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '../api/auth.api';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Vérifier le token au chargement
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Connexion
    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const response = await loginApi(email, password);
            localStorage.setItem('auth_token', response.token);
            if (response.refreshToken) {
                localStorage.setItem('refresh_token', response.refreshToken);
            }
            setUser(response.user);
            return response.user;
        } catch (err) {
            const errorMessage = err.message || 'Identifiants incorrects';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Déconnexion
    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
        }
    }, []);

    // Vérifications de rôle
    const isSuperAdmin = user?.role_id === ROLES.SUPER_ADMIN;

    const isSousAdmin = [
        ROLES.SOUS_ADMIN_AGENCES,
        ROLES.SOUS_ADMIN_FINANCE,
        ROLES.SOUS_ADMIN_OPERATIONS,
        ROLES.SOUS_ADMIN_SUPPORT
    ].includes(user?.role_id);

    const isAgencyUser = [
        ROLES.ADMIN_AGENCE,
        ROLES.AGENT_AGENCE
    ].includes(user?.role_id);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin,
        isSousAdmin,
        isAgencyUser,
        roleId: user?.role_id,
        agencyId: user?.agence_id
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
}

export default AuthContext;
