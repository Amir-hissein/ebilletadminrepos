// ============================================
// DONNÉES DÉMO ALIGNÉES AVEC LE SCHÉMA DB
// Structure: ebillet_dbdiagram.dbml
// ============================================

import { ROLES, AGENCY_STATUS, TRANSPORT_TYPES, SERVICE_TYPES } from '../utils/constants';

// ============================================
// TABLE: villes
// ============================================
export const DEMO_VILLES = [
    { id: 1, nom: "N'Djamena", pays: 'Tchad', code: 'NDJ', actif: true },
    { id: 2, nom: 'Moundou', pays: 'Tchad', code: 'MND', actif: true },
    { id: 3, nom: 'Sarh', pays: 'Tchad', code: 'SRH', actif: true },
    { id: 4, nom: 'Abéché', pays: 'Tchad', code: 'ABE', actif: true },
    { id: 5, nom: 'Kélo', pays: 'Tchad', code: 'KEL', actif: true },
    { id: 6, nom: 'Koumra', pays: 'Tchad', code: 'KMR', actif: true },
    { id: 7, nom: 'Bongor', pays: 'Tchad', code: 'BNG', actif: true },
    { id: 8, nom: 'Mongo', pays: 'Tchad', code: 'MNG', actif: true },
    { id: 9, nom: 'Doba', pays: 'Tchad', code: 'DBA', actif: true },
    { id: 10, nom: 'Pala', pays: 'Tchad', code: 'PLA', actif: true }
];

// ============================================
// TABLE: roles
// ============================================
export const DEMO_ROLES = [
    { id: 1, nom: 'Super Admin', description: 'Accès total à la plateforme', niveau_acces: 1 },
    { id: 2, nom: 'Sous-Admin', description: 'Sous-administrateur spécialisé', niveau_acces: 2 },
    { id: 3, nom: 'Admin Agence', description: 'Administrateur d\'agence de voyage', niveau_acces: 3 },
    { id: 4, nom: 'Agent Agence', description: 'Agent vendeur d\'agence', niveau_acces: 4 }
];

// ============================================
// TABLE: types_sous_admin
// ============================================
export const DEMO_TYPES_SOUS_ADMIN = [
    { id: 1, code: 'AGENCES', libelle: 'Gestion des Agences', description: 'Gère les agences de voyage' },
    { id: 2, code: 'FINANCE', libelle: 'Gestion Financière', description: 'Gère les transactions et commissions' },
    { id: 3, code: 'OPERATIONS', libelle: 'Opérations', description: 'Gère les voyages et réservations' },
    { id: 4, code: 'SUPPORT', libelle: 'Support Client', description: 'Gère les plaintes et litiges' }
];

// ============================================
// TABLE: agences
// ============================================
export const DEMO_AGENCES = [
    {
        id: 1,
        nom: 'Transport Express Tchad',
        type_service: SERVICE_TYPES.BUS,
        adresse: 'Avenue Charles de Gaulle, Quartier Résidentiel',
        ville: "N'Djamena",
        telephone: '+235 66 00 11 22',
        email: 'contact@transportexpress.td',
        numero_licence: 'LIC-2024-001',
        logo: null,
        statut: AGENCY_STATUS.ACTIVE,
        commission_pourcentage: 10.00,
        created_by: 1, // Super Admin
        validated_by: 1,
        validated_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        nom: 'Voyage Sahel',
        type_service: SERVICE_TYPES.BUS,
        adresse: 'Rue du Commerce, Centre-ville',
        ville: "N'Djamena",
        telephone: '+235 66 00 22 33',
        email: 'info@voyagesahel.td',
        numero_licence: 'LIC-2024-002',
        logo: null,
        statut: AGENCY_STATUS.ACTIVE,
        commission_pourcentage: 10.00,
        created_by: 1,
        validated_by: 1,
        validated_at: '2024-02-01T10:00:00Z',
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z'
    },
    {
        id: 3,
        nom: 'Toumaï Transport',
        type_service: SERVICE_TYPES.BUS,
        adresse: 'Boulevard de la Liberté',
        ville: "N'Djamena",
        telephone: '+235 66 00 33 44',
        email: 'contact@toumaitransport.td',
        numero_licence: 'LIC-2024-003',
        logo: null,
        statut: AGENCY_STATUS.SUSPENDED,
        commission_pourcentage: 12.00,
        created_by: 1,
        validated_by: 1,
        validated_at: '2024-02-15T10:00:00Z',
        created_at: '2024-02-10T10:00:00Z',
        updated_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 4,
        nom: 'Express Bus Moundou',
        type_service: SERVICE_TYPES.BUS,
        adresse: 'Avenue des Martyrs',
        ville: 'Moundou',
        telephone: '+235 66 00 44 55',
        email: 'contact@expressbusmoundou.td',
        numero_licence: 'LIC-2024-004',
        logo: null,
        statut: AGENCY_STATUS.ACTIVE,
        commission_pourcentage: 10.00,
        created_by: 1,
        validated_by: 1,
        validated_at: '2024-03-01T10:00:00Z',
        created_at: '2024-02-25T10:00:00Z',
        updated_at: '2024-03-01T10:00:00Z'
    },
    {
        id: 5,
        nom: 'Air Tchad Express',
        type_service: SERVICE_TYPES.PLANE,
        adresse: 'Aéroport International Hassan Djamous',
        ville: "N'Djamena",
        telephone: '+235 66 00 55 66',
        email: 'reservations@airtchadexpress.td',
        numero_licence: 'LIC-AIR-2024-001',
        logo: null,
        statut: AGENCY_STATUS.ACTIVE,
        commission_pourcentage: 8.00,
        created_by: 1,
        validated_by: 1,
        validated_at: '2024-03-15T10:00:00Z',
        created_at: '2024-03-10T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
    },
    {
        id: 6,
        nom: 'Nouvelle Agence Sarh',
        type_service: SERVICE_TYPES.BUS,
        adresse: 'Quartier Commercial',
        ville: 'Sarh',
        telephone: '+235 66 00 66 77',
        email: 'contact@nouvelleagencesarh.td',
        numero_licence: null, // En attente de validation
        logo: null,
        statut: 'en_attente',
        commission_pourcentage: 10.00,
        created_by: 2, // Sous-Admin Agences
        validated_by: null,
        validated_at: null,
        created_at: '2026-02-01T10:00:00Z',
        updated_at: '2026-02-01T10:00:00Z'
    }
];

// ============================================
// TABLE: utilisateurs
// ============================================
export const DEMO_UTILISATEURS = [
    // Super Admin
    {
        id: 1,
        nom: 'Mahamat',
        prenom: 'Ali',
        email: 'super@ebillet.td',
        telephone: '+235 66 00 00 01',
        mot_de_passe: 'hashed_password',
        role_id: 1, // Super Admin
        agence_id: null,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T14:30:00Z',
        created_by: null,
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
        // Relation type_sous_admin (aucune pour Super Admin)
        types_sous_admin: []
    },
    // Sous-Admin Agences
    {
        id: 2,
        nom: 'Deby',
        prenom: 'Ibrahim',
        email: 'agences@ebillet.td',
        telephone: '+235 66 00 00 02',
        mot_de_passe: 'hashed_password',
        role_id: 2, // Sous-Admin
        agence_id: null,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T10:00:00Z',
        created_by: 1,
        created_at: '2023-06-15T10:00:00Z',
        updated_at: '2023-06-15T10:00:00Z',
        types_sous_admin: [{ id: 1, code: 'AGENCES' }]
    },
    // Sous-Admin Finance
    {
        id: 3,
        nom: 'Ousmane',
        prenom: 'Fatima',
        email: 'finance@ebillet.td',
        telephone: '+235 66 00 00 03',
        mot_de_passe: 'hashed_password',
        role_id: 2, // Sous-Admin
        agence_id: null,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-05T16:45:00Z',
        created_by: 1,
        created_at: '2023-08-01T10:00:00Z',
        updated_at: '2023-08-01T10:00:00Z',
        types_sous_admin: [{ id: 2, code: 'FINANCE' }]
    },
    // Sous-Admin Support
    {
        id: 4,
        nom: 'Abakar',
        prenom: 'Hassan',
        email: 'support@ebillet.td',
        telephone: '+235 66 00 00 04',
        mot_de_passe: 'hashed_password',
        role_id: 2, // Sous-Admin
        agence_id: null,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T08:00:00Z',
        created_by: 1,
        created_at: '2023-09-01T10:00:00Z',
        updated_at: '2023-09-01T10:00:00Z',
        types_sous_admin: [{ id: 4, code: 'SUPPORT' }]
    },
    // Admin Agence - Transport Express
    {
        id: 5,
        nom: 'Kamougue',
        prenom: 'Jean',
        email: 'admin@transportexpress.td',
        telephone: '+235 66 00 11 23',
        mot_de_passe: 'hashed_password',
        role_id: 3, // Admin Agence
        agence_id: 1,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T12:00:00Z',
        created_by: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        types_sous_admin: []
    },
    // Admin Agence - Voyage Sahel
    {
        id: 6,
        nom: 'Moussa',
        prenom: 'Abdoulaye',
        email: 'admin@voyagesahel.td',
        telephone: '+235 66 00 22 34',
        mot_de_passe: 'hashed_password',
        role_id: 3, // Admin Agence
        agence_id: 2,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T09:30:00Z',
        created_by: 1,
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z',
        types_sous_admin: []
    },
    // Agent Agence - Transport Express
    {
        id: 7,
        nom: 'Brahim',
        prenom: 'Ahmed',
        email: 'agent1@transportexpress.td',
        telephone: '+235 66 00 11 24',
        mot_de_passe: 'hashed_password',
        role_id: 4, // Agent Agence
        agence_id: 1,
        statut: 'actif',
        photo_profil: null,
        derniere_connexion: '2026-02-06T14:00:00Z',
        created_by: 5,
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z',
        types_sous_admin: []
    },
    // Agent Agence - Transport Express (suspendu)
    {
        id: 8,
        nom: 'Saleh',
        prenom: 'Aisha',
        email: 'agent2@transportexpress.td',
        telephone: '+235 66 00 11 25',
        mot_de_passe: 'hashed_password',
        role_id: 4, // Agent Agence
        agence_id: 1,
        statut: 'suspendu',
        photo_profil: null,
        derniere_connexion: '2026-01-20T09:00:00Z',
        created_by: 5,
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2026-01-25T10:00:00Z',
        types_sous_admin: []
    }
];

// ============================================
// TABLE: voyages
// ============================================
export const DEMO_VOYAGES = [
    {
        id: 1,
        agence_id: 1, // Transport Express
        ville_depart_id: 1, // N'Djamena
        ville_arrivee_id: 2, // Moundou
        date_depart: '2026-02-07',
        heure_depart: '06:00',
        date_arrivee: '2026-02-07',
        heure_arrivee: '14:00',
        prix_unitaire: 15000,
        places_totales: 50,
        places_disponibles: 35,
        type_transport: TRANSPORT_TYPES.BUS,
        numero_vol_bus: 'TE-001',
        statut: 'planifie',
        description: 'Voyage express N\'Djamena - Moundou',
        created_by: 5,
        validated_by: null,
        validated_at: null,
        created_at: '2026-02-01T10:00:00Z',
        updated_at: '2026-02-01T10:00:00Z'
    },
    {
        id: 2,
        agence_id: 1, // Transport Express
        ville_depart_id: 2, // Moundou
        ville_arrivee_id: 1, // N'Djamena
        date_depart: '2026-02-07',
        heure_depart: '15:00',
        date_arrivee: '2026-02-07',
        heure_arrivee: '23:00',
        prix_unitaire: 15000,
        places_totales: 50,
        places_disponibles: 42,
        type_transport: TRANSPORT_TYPES.BUS,
        numero_vol_bus: 'TE-002',
        statut: 'planifie',
        description: 'Voyage retour Moundou - N\'Djamena',
        created_by: 5,
        validated_by: null,
        validated_at: null,
        created_at: '2026-02-01T10:00:00Z',
        updated_at: '2026-02-01T10:00:00Z'
    },
    {
        id: 3,
        agence_id: 2, // Voyage Sahel
        ville_depart_id: 1, // N'Djamena
        ville_arrivee_id: 4, // Abéché
        date_depart: '2026-02-08',
        heure_depart: '05:00',
        date_arrivee: '2026-02-08',
        heure_arrivee: '18:00',
        prix_unitaire: 25000,
        places_totales: 45,
        places_disponibles: 28,
        type_transport: TRANSPORT_TYPES.BUS,
        numero_vol_bus: 'VS-101',
        statut: 'planifie',
        description: 'Longue distance N\'Djamena - Abéché',
        created_by: 6,
        validated_by: null,
        validated_at: null,
        created_at: '2026-02-02T10:00:00Z',
        updated_at: '2026-02-02T10:00:00Z'
    },
    {
        id: 4,
        agence_id: 5, // Air Tchad Express
        ville_depart_id: 1, // N'Djamena
        ville_arrivee_id: 4, // Abéché
        date_depart: '2026-02-09',
        heure_depart: '08:00',
        date_arrivee: '2026-02-09',
        heure_arrivee: '09:30',
        prix_unitaire: 75000,
        places_totales: 72,
        places_disponibles: 55,
        type_transport: TRANSPORT_TYPES.PLANE,
        numero_vol_bus: 'AT-201',
        statut: 'planifie',
        description: 'Vol intérieur N\'Djamena - Abéché',
        created_by: 1,
        validated_by: 1,
        validated_at: '2026-02-03T10:00:00Z',
        created_at: '2026-02-03T10:00:00Z',
        updated_at: '2026-02-03T10:00:00Z'
    },
    {
        id: 5,
        agence_id: 1, // Transport Express
        ville_depart_id: 1, // N'Djamena
        ville_arrivee_id: 3, // Sarh
        date_depart: '2026-02-06',
        heure_depart: '07:00',
        date_arrivee: '2026-02-06',
        heure_arrivee: '17:00',
        prix_unitaire: 18000,
        places_totales: 50,
        places_disponibles: 0,
        type_transport: TRANSPORT_TYPES.BUS,
        numero_vol_bus: 'TE-003',
        statut: 'en_cours',
        description: 'En route vers Sarh',
        created_by: 5,
        validated_by: null,
        validated_at: null,
        created_at: '2026-02-01T10:00:00Z',
        updated_at: '2026-02-06T07:00:00Z'
    }
];

// ============================================
// TABLE: clients
// ============================================
export const DEMO_CLIENTS = [
    {
        id: 1,
        nom: 'Ndouba',
        prenom: 'Marie',
        telephone: '+235 66 11 22 33',
        email: 'marie.ndouba@gmail.com',
        numero_piece: 'CNI-123456',
        type_piece: 'CNI',
        created_at: '2025-06-01T10:00:00Z'
    },
    {
        id: 2,
        nom: 'Adoum',
        prenom: 'Mahamat',
        telephone: '+235 66 22 33 44',
        email: 'mahamat.adoum@yahoo.fr',
        numero_piece: 'CNI-234567',
        type_piece: 'CNI',
        created_at: '2025-08-15T10:00:00Z'
    },
    {
        id: 3,
        nom: 'Djimtebaye',
        prenom: 'Paul',
        telephone: '+235 66 33 44 55',
        email: null,
        numero_piece: 'PASS-789012',
        type_piece: 'passeport',
        created_at: '2025-10-20T10:00:00Z'
    }
];

// ============================================
// TABLE: reservations
// ============================================
export const DEMO_RESERVATIONS = [
    {
        id: 1,
        numero_reservation: 'RES2026020001',
        voyage_id: 1,
        client_id: 1,
        agence_id: 1,
        agent_id: 7,
        nombre_places: 2,
        prix_total: 30000,
        commission_plateforme: 3000,
        montant_agence: 27000,
        statut_paiement: 'paye',
        mode_paiement: 'mobile_money',
        statut_reservation: 'confirmee',
        qr_code: '/qrcodes/RES2026020001.png',
        date_paiement: '2026-02-01T11:00:00Z',
        date_annulation: null,
        motif_annulation: null,
        created_at: '2026-02-01T10:30:00Z',
        updated_at: '2026-02-01T11:00:00Z'
    },
    {
        id: 2,
        numero_reservation: 'RES2026020002',
        voyage_id: 1,
        client_id: 2,
        agence_id: 1,
        agent_id: 7,
        nombre_places: 1,
        prix_total: 15000,
        commission_plateforme: 1500,
        montant_agence: 13500,
        statut_paiement: 'paye',
        mode_paiement: 'especes',
        statut_reservation: 'confirmee',
        qr_code: '/qrcodes/RES2026020002.png',
        date_paiement: '2026-02-02T09:00:00Z',
        date_annulation: null,
        motif_annulation: null,
        created_at: '2026-02-02T08:30:00Z',
        updated_at: '2026-02-02T09:00:00Z'
    },
    {
        id: 3,
        numero_reservation: 'RES2026020003',
        voyage_id: 3,
        client_id: 3,
        agence_id: 2,
        agent_id: 6,
        nombre_places: 3,
        prix_total: 75000,
        commission_plateforme: 7500,
        montant_agence: 67500,
        statut_paiement: 'en_attente',
        mode_paiement: null,
        statut_reservation: 'confirmee',
        qr_code: null,
        date_paiement: null,
        date_annulation: null,
        motif_annulation: null,
        created_at: '2026-02-05T14:00:00Z',
        updated_at: '2026-02-05T14:00:00Z'
    }
];

// ============================================
// TABLE: transactions
// ============================================
export const DEMO_TRANSACTIONS = [
    {
        id: 1,
        reservation_id: 1,
        type_transaction: 'paiement',
        montant: 30000,
        beneficiaire_type: 'agence',
        beneficiaire_id: 1,
        statut: 'completee',
        reference_paiement: 'MM-2026-001',
        created_at: '2026-02-01T11:00:00Z'
    },
    {
        id: 2,
        reservation_id: 1,
        type_transaction: 'commission',
        montant: 3000,
        beneficiaire_type: 'plateforme',
        beneficiaire_id: null,
        statut: 'completee',
        reference_paiement: 'COM-2026-001',
        created_at: '2026-02-01T11:00:00Z'
    },
    {
        id: 3,
        reservation_id: 2,
        type_transaction: 'paiement',
        montant: 15000,
        beneficiaire_type: 'agence',
        beneficiaire_id: 1,
        statut: 'completee',
        reference_paiement: 'ESP-2026-001',
        created_at: '2026-02-02T09:00:00Z'
    }
];

// ============================================
// TABLE: plaintes
// ============================================
export const DEMO_PLAINTES = [
    {
        id: 1,
        reservation_id: null,
        client_id: 1,
        agence_id: 3, // Toumaï Transport (suspendue)
        type_plainte: 'service',
        description: 'Le bus était en très mauvais état et le chauffeur conduisait de manière dangereuse.',
        statut: 'resolue',
        priorite: 'haute',
        assigne_a: 4, // Sous-Admin Support
        validated_by: 1,
        resolution: 'Agence suspendue suite à multiples plaintes similaires. Remboursement effectué.',
        date_resolution: '2026-01-28T16:00:00Z',
        created_at: '2026-01-25T10:00:00Z',
        updated_at: '2026-01-28T16:00:00Z'
    },
    {
        id: 2,
        reservation_id: 2,
        client_id: 2,
        agence_id: 1,
        type_plainte: 'retard',
        description: 'Le bus est parti avec 2 heures de retard sans explication.',
        statut: 'en_traitement',
        priorite: 'moyenne',
        assigne_a: 4,
        validated_by: null,
        resolution: null,
        date_resolution: null,
        created_at: '2026-02-04T14:00:00Z',
        updated_at: '2026-02-05T09:00:00Z'
    }
];

// ============================================
// TABLE: actions_critiques (validations Super Admin)
// ============================================
export const DEMO_ACTIONS_CRITIQUES = [
    {
        id: 1,
        type_action: 'bloquer_agence',
        entite_type: 'agence',
        entite_id: 3,
        demandeur_id: 2, // Sous-Admin Agences
        validateur_id: 1, // Super Admin
        statut: 'validee',
        description: 'Suspension de Toumaï Transport suite à multiples plaintes clients',
        donnees_action: { motif: 'Plaintes répétées', nb_plaintes: 5 },
        motif_rejet: null,
        date_demande: '2026-01-27T10:00:00Z',
        date_traitement: '2026-01-27T14:00:00Z'
    },
    {
        id: 2,
        type_action: 'valider_agence',
        entite_type: 'agence',
        entite_id: 6,
        demandeur_id: 2,
        validateur_id: null,
        statut: 'en_attente',
        description: 'Demande de validation pour Nouvelle Agence Sarh',
        donnees_action: { documents_fournis: true },
        motif_rejet: null,
        date_demande: '2026-02-01T15:00:00Z',
        date_traitement: null
    }
];

// ============================================
// FONCTIONS HELPER
// ============================================

// Obtenir le nom d'une ville par son ID
export function getVilleNom(villeId) {
    const ville = DEMO_VILLES.find(v => v.id === villeId);
    return ville ? ville.nom : 'Inconnue';
}

// Obtenir une agence par son ID
export function getAgenceById(agenceId) {
    return DEMO_AGENCES.find(a => a.id === agenceId);
}

// Obtenir un utilisateur par son ID
export function getUtilisateurById(userId) {
    return DEMO_UTILISATEURS.find(u => u.id === userId);
}

// Enrichir un voyage avec les noms des villes et de l'agence
export function enrichVoyage(voyage) {
    return {
        ...voyage,
        ville_depart_nom: getVilleNom(voyage.ville_depart_id),
        ville_arrivee_nom: getVilleNom(voyage.ville_arrivee_id),
        agence: getAgenceById(voyage.agence_id)
    };
}

// Enrichir une réservation avec toutes les relations
export function enrichReservation(reservation) {
    const voyage = DEMO_VOYAGES.find(v => v.id === reservation.voyage_id);
    return {
        ...reservation,
        // Mapper les champs pour compatibilité
        code_reservation: reservation.numero_reservation,
        montant_total: reservation.prix_total,
        statut: reservation.statut_reservation,
        voyage: voyage ? enrichVoyage(voyage) : null,
        client: DEMO_CLIENTS.find(c => c.id === reservation.client_id),
        agence: getAgenceById(reservation.agence_id),
        agent: getUtilisateurById(reservation.agent_id)
    };
}

// Obtenir un voyage par son ID
export function getVoyageById(voyageId) {
    return DEMO_VOYAGES.find(v => v.id === voyageId);
}

// Obtenir un client par son ID
export function getClientById(clientId) {
    return DEMO_CLIENTS.find(c => c.id === clientId);
}
