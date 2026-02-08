// ============================================
// API UTILISATEURS - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS } from '../utils/constants';
import {
    DEMO_UTILISATEURS,
    DEMO_ROLES,
    DEMO_TYPES_SOUS_ADMIN,
    getAgenceById
} from './database.demo';

// Mode démo activé (pas de backend)
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let utilisateursData = [...DEMO_UTILISATEURS];

// ============================================
// FONCTIONS HELPER
// ============================================

function getRoleNom(roleId) {
    const role = DEMO_ROLES.find(r => r.id === roleId);
    return role ? role.nom : 'Inconnu';
}

function getRoleNiveauAcces(roleId) {
    const role = DEMO_ROLES.find(r => r.id === roleId);
    return role ? role.niveau_acces : 4;
}

function enrichUser(user) {
    return {
        ...user,
        role_nom: getRoleNom(user.role_id),
        niveau_acces: getRoleNiveauAcces(user.role_id),
        agence: user.agence_id ? getAgenceById(user.agence_id) : null,
        agence_nom: user.agence_id ? getAgenceById(user.agence_id)?.nom : null
    };
}

// ============================================
// FONCTIONS DÉMO
// ============================================

function demoGetUsers(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...utilisateursData];

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(u => u.statut === filters.statut);
            }

            // Filtre par rôle
            if (filters.role_id) {
                result = result.filter(u => u.role_id === parseInt(filters.role_id));
            }

            // Filtre par niveau d'accès (admin plateforme vs agence)
            if (filters.niveau_acces) {
                result = result.filter(u => getRoleNiveauAcces(u.role_id) === parseInt(filters.niveau_acces));
            }

            // Filtre par agence
            if (filters.agence_id) {
                result = result.filter(u => u.agence_id === parseInt(filters.agence_id));
            }

            // Recherche par nom/email/telephone
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(u =>
                    u.nom.toLowerCase().includes(search) ||
                    u.prenom.toLowerCase().includes(search) ||
                    u.email.toLowerCase().includes(search) ||
                    u.telephone.includes(search)
                );
            }

            // Enrichir avec les relations
            result = result.map(enrichUser);

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 10
            });
        }, 300);
    });
}

function demoGetUserById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = utilisateursData.find(u => u.id === parseInt(id));
            if (user) {
                resolve(enrichUser(user));
            } else {
                reject(new Error('Utilisateur non trouvé'));
            }
        }, 200);
    });
}

function demoCreateUser(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser = {
                id: utilisateursData.length + 1,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                mot_de_passe: 'hashed_password', // En réalité, hashé côté serveur
                role_id: data.role_id,
                agence_id: data.agence_id || null,
                statut: 'actif',
                photo_profil: data.photo_profil || null,
                derniere_connexion: null,
                created_by: data.created_by || 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                types_sous_admin: data.types_sous_admin || []
            };
            utilisateursData.push(newUser);
            resolve(enrichUser(newUser));
        }, 500);
    });
}

function demoUpdateUser(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = utilisateursData.findIndex(u => u.id === parseInt(id));
            if (index !== -1) {
                utilisateursData[index] = {
                    ...utilisateursData[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };
                resolve(enrichUser(utilisateursData[index]));
            } else {
                reject(new Error('Utilisateur non trouvé'));
            }
        }, 500);
    });
}

function demoUpdateUserStatus(id, statut) {
    return demoUpdateUser(id, { statut });
}

// ============================================
// EXPORTS API
// ============================================

export async function getUsers(filters = {}) {
    if (DEMO_MODE) {
        return demoGetUsers(filters);
    }
    const response = await api.get(ENDPOINTS.USERS, { params: filters });
    return response.data;
}

export async function getUserById(id) {
    if (DEMO_MODE) {
        return demoGetUserById(id);
    }
    const response = await api.get(`${ENDPOINTS.USERS}/${id}`);
    return response.data;
}

export async function createUser(data) {
    if (DEMO_MODE) {
        return demoCreateUser(data);
    }
    const response = await api.post(ENDPOINTS.USERS, data);
    return response.data;
}

export async function updateUser(id, data) {
    if (DEMO_MODE) {
        return demoUpdateUser(id, data);
    }
    const response = await api.put(`${ENDPOINTS.USERS}/${id}`, data);
    return response.data;
}

export async function updateUserStatus(id, statut) {
    if (DEMO_MODE) {
        return demoUpdateUserStatus(id, statut);
    }
    const response = await api.patch(`${ENDPOINTS.USERS}/${id}/status`, { statut });
    return response.data;
}

export async function deleteUser(id) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                utilisateursData = utilisateursData.filter(u => u.id !== parseInt(id));
                resolve({ success: true });
            }, 500);
        });
    }
    const response = await api.delete(`${ENDPOINTS.USERS}/${id}`);
    return response.data;
}

// Statistiques des utilisateurs
export async function getUsersStats() {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    total: utilisateursData.length,
                    actif: utilisateursData.filter(u => u.statut === 'actif').length,
                    suspendu: utilisateursData.filter(u => u.statut === 'suspendu').length,
                    inactif: utilisateursData.filter(u => u.statut === 'inactif').length,
                    par_role: {
                        super_admin: utilisateursData.filter(u => u.role_id === 1).length,
                        sous_admin: utilisateursData.filter(u => u.role_id === 2).length,
                        admin_agence: utilisateursData.filter(u => u.role_id === 3).length,
                        agent_agence: utilisateursData.filter(u => u.role_id === 4).length
                    }
                });
            }, 100);
        });
    }
    const response = await api.get(`${ENDPOINTS.USERS}/stats`);
    return response.data;
}

// Obtenir les rôles disponibles
export function getRoles() {
    return DEMO_ROLES;
}

// Obtenir les types de sous-admin
export function getTypesSousAdmin() {
    return DEMO_TYPES_SOUS_ADMIN;
}
