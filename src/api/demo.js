import { ROLES } from '../utils/constants';

// ============================================
// MODE DÉMO - Utilisateurs fictifs pour tests
// ============================================

export const DEMO_USERS = [
    {
        id: 1,
        email: 'super@ebillet.td',
        password: 'admin123',
        nom: 'Mahamat',
        prenom: 'Ali',
        telephone: '+235 66 00 00 01',
        role_id: ROLES.SUPER_ADMIN,
        agence_id: null,
        statut: 'actif'
    },
    {
        id: 2,
        email: 'agences@ebillet.td',
        password: 'admin123',
        nom: 'Deby',
        prenom: 'Fatima',
        telephone: '+235 66 00 00 02',
        role_id: ROLES.SOUS_ADMIN_AGENCES,
        agence_id: null,
        statut: 'actif'
    },
    {
        id: 3,
        email: 'finance@ebillet.td',
        password: 'admin123',
        nom: 'Oumar',
        prenom: 'Hassan',
        telephone: '+235 66 00 00 03',
        role_id: ROLES.SOUS_ADMIN_FINANCE,
        agence_id: null,
        statut: 'actif'
    },
    {
        id: 4,
        email: 'admin@transportexpress.td',
        password: 'admin123',
        nom: 'Kamougue',
        prenom: 'Jean',
        telephone: '+235 66 00 00 04',
        role_id: ROLES.ADMIN_AGENCE,
        agence_id: 1,
        agence_nom: 'Transport Express',
        statut: 'actif'
    },
    {
        id: 5,
        email: 'agent@transportexpress.td',
        password: 'admin123',
        nom: 'Abakar',
        prenom: 'Marie',
        telephone: '+235 66 00 00 05',
        role_id: ROLES.AGENT_AGENCE,
        agence_id: 1,
        agence_nom: 'Transport Express',
        statut: 'actif'
    }
];

/**
 * Simule une connexion en mode démo
 */
export function demoLogin(email, password) {
    return new Promise((resolve, reject) => {
        // Simuler un délai réseau
        setTimeout(() => {
            const user = DEMO_USERS.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (user) {
                // Ne pas renvoyer le mot de passe
                const { password: _, ...userWithoutPassword } = user;
                resolve({
                    token: 'demo_token_' + user.id + '_' + Date.now(),
                    refreshToken: 'demo_refresh_' + user.id,
                    user: userWithoutPassword
                });
            } else {
                reject(new Error('Email ou mot de passe incorrect'));
            }
        }, 800); // Délai de 800ms pour simuler le réseau
    });
}

/**
 * Simule la récupération de l'utilisateur courant
 */
export function demoGetCurrentUser() {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('auth_token');

        if (token && token.startsWith('demo_token_')) {
            // Extraire l'ID utilisateur du token
            const userId = parseInt(token.split('_')[2]);
            const user = DEMO_USERS.find(u => u.id === userId);

            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                setTimeout(() => resolve(userWithoutPassword), 200);
            } else {
                reject(new Error('Utilisateur non trouvé'));
            }
        } else {
            reject(new Error('Token invalide'));
        }
    });
}
