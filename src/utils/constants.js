// Rôles du système E-Billet Tchad
export const ROLES = {
    SUPER_ADMIN: 1,
    SOUS_ADMIN_AGENCES: 2,
    SOUS_ADMIN_FINANCE: 3,
    SOUS_ADMIN_OPERATIONS: 4,
    SOUS_ADMIN_SUPPORT: 5,
    ADMIN_AGENCE: 6,
    AGENT_AGENCE: 7
};

export const ROLE_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.SOUS_ADMIN_AGENCES]: 'Sous-Admin Agences',
    [ROLES.SOUS_ADMIN_FINANCE]: 'Sous-Admin Finance',
    [ROLES.SOUS_ADMIN_OPERATIONS]: 'Sous-Admin Opérations',
    [ROLES.SOUS_ADMIN_SUPPORT]: 'Sous-Admin Support',
    [ROLES.ADMIN_AGENCE]: 'Admin Agence',
    [ROLES.AGENT_AGENCE]: 'Agent Agence'
};

export const ROLE_LEVELS = {
    [ROLES.SUPER_ADMIN]: 1,
    [ROLES.SOUS_ADMIN_AGENCES]: 2,
    [ROLES.SOUS_ADMIN_FINANCE]: 2,
    [ROLES.SOUS_ADMIN_OPERATIONS]: 2,
    [ROLES.SOUS_ADMIN_SUPPORT]: 2,
    [ROLES.ADMIN_AGENCE]: 3,
    [ROLES.AGENT_AGENCE]: 4
};

// Statuts des entités
export const AGENCY_STATUS = {
    ACTIVE: 'active',
    SUSPENDED: 'suspendue',
    CLOSED: 'fermee'
};

export const AGENCY_STATUS_LABELS = {
    [AGENCY_STATUS.ACTIVE]: 'Active',
    [AGENCY_STATUS.SUSPENDED]: 'Suspendue',
    [AGENCY_STATUS.CLOSED]: 'Fermée'
};

export const USER_STATUS = {
    ACTIVE: 'actif',
    SUSPENDED: 'suspendu',
    INACTIVE: 'inactif'
};

export const USER_STATUS_LABELS = {
    [USER_STATUS.ACTIVE]: 'Actif',
    [USER_STATUS.SUSPENDED]: 'Suspendu',
    [USER_STATUS.INACTIVE]: 'Inactif'
};

export const TRIP_STATUS = {
    PLANNED: 'planifie',
    IN_PROGRESS: 'en_cours',
    COMPLETED: 'termine',
    CANCELLED: 'annule'
};

export const TRIP_STATUS_LABELS = {
    [TRIP_STATUS.PLANNED]: 'Planifié',
    [TRIP_STATUS.IN_PROGRESS]: 'En cours',
    [TRIP_STATUS.COMPLETED]: 'Terminé',
    [TRIP_STATUS.CANCELLED]: 'Annulé'
};

export const RESERVATION_STATUS = {
    PENDING: 'en_attente',
    CONFIRMED: 'confirmee',
    CANCELLED: 'annulee',
    USED: 'utilisee',
    REFUNDED: 'remboursee'
};

export const RESERVATION_STATUS_LABELS = {
    [RESERVATION_STATUS.PENDING]: 'En attente',
    [RESERVATION_STATUS.CONFIRMED]: 'Confirmée',
    [RESERVATION_STATUS.CANCELLED]: 'Annulée',
    [RESERVATION_STATUS.USED]: 'Utilisée',
    [RESERVATION_STATUS.REFUNDED]: 'Remboursée'
};

export const PAYMENT_STATUS = {
    PENDING: 'en_attente',
    COMPLETED: 'complete',
    PAID: 'paye',
    FAILED: 'echoue',
    REFUNDED: 'rembourse'
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'En attente',
    [PAYMENT_STATUS.COMPLETED]: 'Complété',
    [PAYMENT_STATUS.PAID]: 'Payé',
    [PAYMENT_STATUS.FAILED]: 'Échoué',
    [PAYMENT_STATUS.REFUNDED]: 'Remboursé'
};

export const TRANSPORT_TYPES = {
    BUS: 'bus',
    PLANE: 'avion'
};

export const TRANSPORT_TYPES_LABELS = {
    [TRANSPORT_TYPES.BUS]: 'Bus',
    [TRANSPORT_TYPES.PLANE]: 'Avion'
};

export const SERVICE_TYPES = {
    BUS: 'bus',
    PLANE: 'avion',
    MIXED: 'mixte'
};

export const COMPLAINT_STATUS = {
    OPEN: 'ouverte',
    IN_PROGRESS: 'en_traitement',
    RESOLVED: 'resolue',
    CLOSED: 'fermee'
};

export const COMPLAINT_PRIORITY = {
    LOW: 'basse',
    MEDIUM: 'moyenne',
    HIGH: 'haute'
};

export const CRITICAL_ACTION_STATUS = {
    PENDING: 'en_attente',
    APPROVED: 'validee',
    REJECTED: 'rejetee'
};

// API Endpoints
export const API_BASE_URL = '/api';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        REFRESH: '/auth/refresh'
    },
    USERS: '/users',
    AGENCIES: '/agencies',
    TRIPS: '/trips',
    RESERVATIONS: '/reservations',
    TRANSACTIONS: '/transactions',
    COMPLAINTS: '/complaints',
    CITIES: '/cities',
    CRITICAL_ACTIONS: '/critical-actions',
    STATS: '/stats'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
