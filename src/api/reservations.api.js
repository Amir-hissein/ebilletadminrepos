// ============================================
// API RÉSERVATIONS - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS, RESERVATION_STATUS, PAYMENT_STATUS } from '../utils/constants';
import {
    DEMO_RESERVATIONS,
    DEMO_CLIENTS,
    enrichReservation,
    getVoyageById,
    getClientById,
    getAgenceById,
    getUtilisateurById
} from './database.demo';

// Mode démo activé
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
// Copie mutable pour les opérations CRUD en démo
let reservationsData = [...DEMO_RESERVATIONS];
let clientsData = [...DEMO_CLIENTS];

// ============================================
// FONCTIONS DÉMO - RÉSERVATIONS
// ============================================

function demoGetReservations(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...reservationsData];

            // Filtre par agence
            if (filters.agence_id) {
                result = result.filter(r => r.agence_id === parseInt(filters.agence_id));
            }

            // Filtre par voyage
            if (filters.voyage_id) {
                result = result.filter(r => r.voyage_id === parseInt(filters.voyage_id));
            }

            // Filtre par statut réservation
            if (filters.statut) {
                result = result.filter(r => r.statut_reservation === filters.statut);
            }

            // Filtre par statut paiement
            if (filters.statut_paiement) {
                result = result.filter(r => r.statut_paiement === filters.statut_paiement);
            }

            // Filtre par client
            if (filters.client_id) {
                result = result.filter(r => r.client_id === parseInt(filters.client_id));
            }

            // Filtre par date
            if (filters.date_debut && filters.date_fin) {
                result = result.filter(r =>
                    r.created_at >= filters.date_debut &&
                    r.created_at <= filters.date_fin
                );
            }

            // Recherche par code ou client
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(r => {
                    const client = getClientById(r.client_id);
                    return (
                        r.numero_reservation?.toLowerCase().includes(search) ||
                        client?.nom?.toLowerCase().includes(search) ||
                        client?.prenom?.toLowerCase().includes(search) ||
                        client?.telephone?.includes(search)
                    );
                });
            }

            // Enrichir avec les relations
            result = result.map(enrichReservation);

            // Trier par date (plus récent en premier)
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 20
            });
        }, 300);
    });
}

function demoGetReservationById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            let reservation = reservationsData.find(r => r.id === parseInt(id));

            // Try finding by code if not found by ID (handling string IDs)
            if (!reservation) {
                reservation = reservationsData.find(r =>
                    r.numero_reservation === id ||
                    r.code_reservation === id
                );
            }

            if (reservation) {
                resolve(enrichReservation(reservation));
            } else {
                reject(new Error('Réservation non trouvée'));
            }
        }, 200);
    });
}

function demoCreateReservation(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Générer code réservation unique
            const code = `RES-${Date.now().toString(36).toUpperCase()}`;

            // Calculer montants
            const voyage = getVoyageById(data.voyage_id);
            const montantTotal = voyage ? voyage.prix_unitaire * data.nombre_places : 0;
            const commissionPlateforme = montantTotal * 0.10; // 10%
            const montantAgence = montantTotal - commissionPlateforme;

            const newReservation = {
                id: reservationsData.length + 1,
                code_reservation: code,
                voyage_id: data.voyage_id,
                client_id: data.client_id,
                agence_id: data.agence_id,
                agent_id: data.agent_id,
                nombre_places: data.nombre_places,
                montant_total: montantTotal,
                commission_plateforme: commissionPlateforme,
                montant_agence: montantAgence,
                statut: RESERVATION_STATUS.PENDING,
                statut_paiement: PAYMENT_STATUS.PENDING,
                mode_paiement: data.mode_paiement || null,
                reference_paiement: null,
                date_paiement: null,
                notes: data.notes || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            reservationsData.push(newReservation);
            resolve(enrichReservation(newReservation));
        }, 500);
    });
}

function demoUpdateReservation(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = reservationsData.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                reservationsData[index] = {
                    ...reservationsData[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };
                resolve(enrichReservation(reservationsData[index]));
            } else {
                reject(new Error('Réservation non trouvée'));
            }
        }, 500);
    });
}

function demoConfirmReservation(id, paiementData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = reservationsData.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                reservationsData[index] = {
                    ...reservationsData[index],
                    statut: RESERVATION_STATUS.CONFIRMED,
                    statut_paiement: PAYMENT_STATUS.COMPLETED,
                    mode_paiement: paiementData.mode_paiement,
                    reference_paiement: paiementData.reference || `PAY-${Date.now()}`,
                    date_paiement: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                resolve(enrichReservation(reservationsData[index]));
            } else {
                reject(new Error('Réservation non trouvée'));
            }
        }, 500);
    });
}

function demoCancelReservation(id, motif) {
    return demoUpdateReservation(id, {
        statut: RESERVATION_STATUS.CANCELLED,
        notes: motif
    });
}

// ============================================
// FONCTIONS DÉMO - CLIENTS
// ============================================

function demoGetClients(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...clientsData];

            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(c =>
                    c.nom?.toLowerCase().includes(search) ||
                    c.prenom?.toLowerCase().includes(search) ||
                    c.telephone?.includes(search) ||
                    c.email?.toLowerCase().includes(search)
                );
            }

            resolve({ data: result, total: result.length });
        }, 200);
    });
}

function demoCreateClient(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newClient = {
                id: clientsData.length + 1,
                nom: data.nom,
                prenom: data.prenom,
                telephone: data.telephone,
                email: data.email || null,
                type_piece: data.type_piece || null,
                numero_piece: data.numero_piece || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            clientsData.push(newClient);
            resolve(newClient);
        }, 300);
    });
}

// ============================================
// EXPORTS API - RÉSERVATIONS
// ============================================

export async function getReservations(filters = {}) {
    if (DEMO_MODE) {
        return demoGetReservations(filters);
    }
    const response = await api.get(ENDPOINTS.RESERVATIONS, { params: filters });
    return response.data;
}

export async function getReservationById(id) {
    if (DEMO_MODE) {
        return demoGetReservationById(id);
    }
    const response = await api.get(`${ENDPOINTS.RESERVATIONS}/${id}`);
    return response.data;
}

export async function createReservation(data) {
    if (DEMO_MODE) {
        return demoCreateReservation(data);
    }
    const response = await api.post(ENDPOINTS.RESERVATIONS, data);
    return response.data;
}

export async function updateReservation(id, data) {
    if (DEMO_MODE) {
        return demoUpdateReservation(id, data);
    }
    const response = await api.put(`${ENDPOINTS.RESERVATIONS}/${id}`, data);
    return response.data;
}

export async function confirmReservation(id, paiementData) {
    if (DEMO_MODE) {
        return demoConfirmReservation(id, paiementData);
    }
    const response = await api.post(`${ENDPOINTS.RESERVATIONS}/${id}/confirm`, paiementData);
    return response.data;
}

export async function cancelReservation(id, motif) {
    if (DEMO_MODE) {
        return demoCancelReservation(id, motif);
    }
    const response = await api.post(`${ENDPOINTS.RESERVATIONS}/${id}/cancel`, { motif });
    return response.data;
}

// Statistiques des réservations
export async function getReservationsStats(filters = {}) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let data = filters.agence_id
                    ? reservationsData.filter(r => r.agence_id === parseInt(filters.agence_id))
                    : reservationsData;

                const totalMontant = data.reduce((sum, r) => sum + r.montant_total, 0);
                const totalCommission = data.reduce((sum, r) => sum + r.commission_plateforme, 0);

                resolve({
                    total: data.length,
                    en_attente: data.filter(r => r.statut === 'en_attente').length,
                    confirmee: data.filter(r => r.statut === 'confirmee').length,
                    annulee: data.filter(r => r.statut === 'annulee').length,
                    montant_total: totalMontant,
                    commission_totale: totalCommission,
                    paiement_complet: data.filter(r => r.statut_paiement === 'complete').length,
                    paiement_attente: data.filter(r => r.statut_paiement === 'en_attente').length
                });
            }, 100);
        });
    }
    const response = await api.get(`${ENDPOINTS.RESERVATIONS}/stats`, { params: filters });
    return response.data;
}

// ============================================
// EXPORTS API - CLIENTS
// ============================================

export async function getClients(filters = {}) {
    if (DEMO_MODE) {
        return demoGetClients(filters);
    }
    const response = await api.get('/clients', { params: filters });
    return response.data;
}

export async function createClient(data) {
    if (DEMO_MODE) {
        return demoCreateClient(data);
    }
    const response = await api.post('/clients', data);
    return response.data;
}
