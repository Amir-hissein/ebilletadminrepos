import { ROLES, ROLE_NAMES, USER_STATUS_LABELS } from '../utils/constants';

// ============================================
// MODE DÉMO - Données fictives utilisateurs
// ============================================

export const DEMO_USERS_LIST = [
    // Super Admin
    {
        id: 1,
        nom: 'Mahamat',
        prenom: 'Ali',
        email: 'super@ebillet.td',
        telephone: '+235 66 00 00 01',
        role_id: ROLES.SUPER_ADMIN,
        statut: 'actif',
        agence_id: null,
        agence_nom: null,
        date_creation: '2023-01-01T10:00:00Z',
        derniere_connexion: '2026-02-06T14:30:00Z'
    },
    // Sous-Admins
    {
        id: 2,
        nom: 'Deby',
        prenom: 'Ibrahim',
        email: 'agences@ebillet.td',
        telephone: '+235 66 00 00 02',
        role_id: ROLES.SOUS_ADMIN_AGENCES,
        statut: 'actif',
        agence_id: null,
        agence_nom: null,
        date_creation: '2023-06-15T10:00:00Z',
        derniere_connexion: '2026-02-06T10:00:00Z'
    },
    {
        id: 3,
        nom: 'Ousmane',
        prenom: 'Fatima',
        email: 'finance@ebillet.td',
        telephone: '+235 66 00 00 03',
        role_id: ROLES.SOUS_ADMIN_FINANCE,
        statut: 'actif',
        agence_id: null,
        agence_nom: null,
        date_creation: '2023-08-01T10:00:00Z',
        derniere_connexion: '2026-02-05T16:45:00Z'
    },
    // Admins Agence
    {
        id: 4,
        nom: 'Kamougue',
        prenom: 'Jean',
        email: 'admin@transportexpress.td',
        telephone: '+235 66 00 11 23',
        role_id: ROLES.ADMIN_AGENCE,
        statut: 'actif',
        agence_id: 1,
        agence_nom: 'Transport Express',
        date_creation: '2024-01-15T10:00:00Z',
        derniere_connexion: '2026-02-06T12:00:00Z'
    },
    {
        id: 5,
        nom: 'Ngakoutou',
        prenom: 'Pierre',
        email: 'admin@expressbusmoundou.td',
        telephone: '+235 66 00 44 56',
        role_id: ROLES.ADMIN_AGENCE,
        statut: 'actif',
        agence_id: 4,
        agence_nom: 'Express Bus Moundou',
        date_creation: '2024-03-01T10:00:00Z',
        derniere_connexion: '2026-02-06T08:30:00Z'
    },
    // Agents Agence
    {
        id: 6,
        nom: 'Brahim',
        prenom: 'Ahmed',
        email: 'agent1@transportexpress.td',
        telephone: '+235 66 00 11 24',
        role_id: ROLES.AGENT_AGENCE,
        statut: 'actif',
        agence_id: 1,
        agence_nom: 'Transport Express',
        date_creation: '2024-02-01T10:00:00Z',
        derniere_connexion: '2026-02-06T14:00:00Z'
    },
    {
        id: 7,
        nom: 'Moussa',
        prenom: 'Aisha',
        email: 'agent2@transportexpress.td',
        telephone: '+235 66 00 11 25',
        role_id: ROLES.AGENT_AGENCE,
        statut: 'suspendu',
        agence_id: 1,
        agence_nom: 'Transport Express',
        date_creation: '2024-03-15T10:00:00Z',
        derniere_connexion: '2026-01-20T09:00:00Z'
    },
    {
        id: 8,
        nom: 'Saleh',
        prenom: 'Omar',
        email: 'agent@voyagesahel.td',
        telephone: '+235 66 00 22 35',
        role_id: ROLES.AGENT_AGENCE,
        statut: 'actif',
        agence_id: 2,
        agence_nom: 'Voyage Sahel',
        date_creation: '2024-01-20T10:00:00Z',
        derniere_connexion: '2026-02-05T17:30:00Z'
    }
];

// Simuler le fetch des utilisateurs avec filtres
export function demoGetUsers(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...DEMO_USERS_LIST];

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(u => u.statut === filters.statut);
            }

            // Filtre par rôle
            if (filters.role_id) {
                result = result.filter(u => u.role_id === parseInt(filters.role_id));
            }

            // Filtre par agence
            if (filters.agence_id) {
                result = result.filter(u => u.agence_id === parseInt(filters.agence_id));
            }

            // Recherche par nom/email
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(u =>
                    u.nom.toLowerCase().includes(search) ||
                    u.prenom.toLowerCase().includes(search) ||
                    u.email.toLowerCase().includes(search)
                );
            }

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 10
            });
        }, 300);
    });
}

// Simuler le fetch d'un utilisateur par ID
export function demoGetUserById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = DEMO_USERS_LIST.find(u => u.id === parseInt(id));
            if (user) {
                resolve(user);
            } else {
                reject(new Error('Utilisateur non trouvé'));
            }
        }, 200);
    });
}

// Simuler la création d'un utilisateur
export function demoCreateUser(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser = {
                id: DEMO_USERS_LIST.length + 1,
                ...data,
                statut: 'actif',
                date_creation: new Date().toISOString(),
                derniere_connexion: null
            };
            DEMO_USERS_LIST.push(newUser);
            resolve(newUser);
        }, 500);
    });
}

// Simuler la mise à jour d'un utilisateur
export function demoUpdateUser(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = DEMO_USERS_LIST.findIndex(u => u.id === parseInt(id));
            if (index !== -1) {
                DEMO_USERS_LIST[index] = { ...DEMO_USERS_LIST[index], ...data };
                resolve(DEMO_USERS_LIST[index]);
            } else {
                reject(new Error('Utilisateur non trouvé'));
            }
        }, 500);
    });
}

// Simuler le changement de statut
export function demoUpdateUserStatus(id, statut) {
    return demoUpdateUser(id, { statut });
}
