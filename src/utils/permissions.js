import { ROLES } from './constants';

/**
 * Permissions par rôle basées sur la documentation E-Billet Tchad
 */
export const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        users: ['create', 'read', 'update', 'delete', 'suspend'],
        sousAdmins: ['create', 'read', 'update', 'delete'],
        agencies: ['create', 'read', 'update', 'delete', 'validate', 'suspend'],
        trips: ['read', 'delete', 'validate'],
        reservations: ['read', 'refund'],
        transactions: ['read'],
        complaints: ['read', 'assign', 'resolve', 'validate'],
        criticalActions: ['read', 'approve', 'reject'],
        settings: ['read', 'update'],
        commissions: ['read', 'update']
    },

    [ROLES.SOUS_ADMIN_AGENCES]: {
        users: ['create_admin_agence', 'read'],
        agencies: ['create', 'read', 'update'],
        trips: ['read'],
        reservations: ['read'],
        transactions: ['read'],
        // Nécessite validation Super Admin
        criticalActions: ['request_block_agency', 'request_delete_agency']
    },

    [ROLES.SOUS_ADMIN_FINANCE]: {
        transactions: ['read', 'export'],
        reservations: ['read'],
        agencies: ['read'],
        reports: ['generate'],
        // Nécessite validation Super Admin
        criticalActions: ['request_modify_commission', 'request_refund']
    },

    [ROLES.SOUS_ADMIN_OPERATIONS]: {
        trips: ['read'],
        reservations: ['read'],
        agencies: ['read'],
        stats: ['read'],
        // Nécessite validation Super Admin
        criticalActions: ['request_delete_trip']
    },

    [ROLES.SOUS_ADMIN_SUPPORT]: {
        complaints: ['read', 'assign', 'resolve'],
        reservations: ['read'],
        clients: ['read'],
        agencies: ['read'],
        // Nécessite validation Super Admin pour litiges critiques
        criticalActions: ['request_critical_resolution']
    },

    [ROLES.ADMIN_AGENCE]: {
        users: ['create_agent', 'read_own_agency', 'update_own_agency'],
        trips: ['create', 'read_own', 'update_own'],
        reservations: ['read_own_agency'],
        transactions: ['read_own_agency'],
        agencyProfile: ['read', 'update']
    },

    [ROLES.AGENT_AGENCE]: {
        trips: ['read_own_agency'],
        reservations: ['create', 'read_own'],
        clients: ['create', 'read']
    }
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole, resource, action) {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
}

/**
 * Vérifie si un utilisateur peut accéder à une ressource
 */
export function canAccess(userRole, resource) {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return false;

    return !!rolePermissions[resource];
}

/**
 * Obtient la liste des ressources accessibles pour un rôle
 */
export function getAccessibleResources(userRole) {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return [];

    return Object.keys(rolePermissions);
}

/**
 * Vérifie si un utilisateur est un Super Admin
 */
export function isSuperAdmin(userRole) {
    return userRole === ROLES.SUPER_ADMIN;
}

/**
 * Vérifie si un utilisateur est un Sous-Admin
 */
export function isSousAdmin(userRole) {
    return [
        ROLES.SOUS_ADMIN_AGENCES,
        ROLES.SOUS_ADMIN_FINANCE,
        ROLES.SOUS_ADMIN_OPERATIONS,
        ROLES.SOUS_ADMIN_SUPPORT
    ].includes(userRole);
}

/**
 * Vérifie si un utilisateur appartient à une agence
 */
export function isAgencyUser(userRole) {
    return [ROLES.ADMIN_AGENCE, ROLES.AGENT_AGENCE].includes(userRole);
}

/**
 * Obtient le niveau d'accès d'un rôle (1 = plus élevé)
 */
export function getAccessLevel(userRole) {
    const levels = {
        [ROLES.SUPER_ADMIN]: 1,
        [ROLES.SOUS_ADMIN_AGENCES]: 2,
        [ROLES.SOUS_ADMIN_FINANCE]: 2,
        [ROLES.SOUS_ADMIN_OPERATIONS]: 2,
        [ROLES.SOUS_ADMIN_SUPPORT]: 2,
        [ROLES.ADMIN_AGENCE]: 3,
        [ROLES.AGENT_AGENCE]: 4
    };
    return levels[userRole] || 99;
}
