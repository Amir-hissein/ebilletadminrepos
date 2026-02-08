// ============================================
// API PLAINTES - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS } from '../utils/constants';
import {
    DEMO_PLAINTES,
    getAgenceById,
    getUtilisateurById,
    enrichReservation,
    DEMO_RESERVATIONS,
    DEMO_CLIENTS
} from './database.demo';

// Mode démo activé
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let plaintesData = [...DEMO_PLAINTES];

// ============================================
// FONCTIONS DÉMO
// ============================================

function enrichPlainte(plainte) {
    const reservation = plainte.reservation_id
        ? DEMO_RESERVATIONS.find(r => r.id === plainte.reservation_id)
        : null;

    return {
        ...plainte,
        agence: getAgenceById(plainte.agence_id),
        client: DEMO_CLIENTS.find(c => c.id === plainte.client_id),
        assigne_a_user: plainte.assigne_a ? getUtilisateurById(plainte.assigne_a) : null,
        reservation: reservation ? enrichReservation(reservation) : null
    };
}

function demoGetComplaints(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...plaintesData];

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(p => p.statut === filters.statut);
            }

            // Filtre par priorité
            if (filters.priorite) {
                result = result.filter(p => p.priorite === filters.priorite);
            }

            // Filtre par type
            if (filters.type) {
                result = result.filter(p => p.type_plainte === filters.type);
            }

            // Enrichir
            result = result.map(enrichPlainte);

            // Tri par date (plus récent d'abord)
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 10
            });
        }, 300);
    });
}

function demoGetComplaintById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const plainte = plaintesData.find(p => p.id === parseInt(id));
            if (plainte) {
                resolve(enrichPlainte(plainte));
            } else {
                reject(new Error('Plainte non trouvée'));
            }
        }, 200);
    });
}

function demoUpdateComplaint(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = plaintesData.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                plaintesData[index] = {
                    ...plaintesData[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };

                // Si résolution ajoutée et statut pas encore résolu, on met à jour
                if (data.resolution && plaintesData[index].statut !== 'resolue') {
                    plaintesData[index].statut = 'resolue';
                    plaintesData[index].date_resolution = new Date().toISOString();
                }

                resolve(enrichPlainte(plaintesData[index]));
            } else {
                reject(new Error('Plainte non trouvée'));
            }
        }, 400);
    });
}

// ============================================
// EXPORTS API
// ============================================

export async function getComplaints(filters = {}) {
    if (DEMO_MODE) {
        return demoGetComplaints(filters);
    }
    const response = await api.get(ENDPOINTS.COMPLAINTS, { params: filters });
    return response.data;
}

export async function getComplaintById(id) {
    if (DEMO_MODE) {
        return demoGetComplaintById(id);
    }
    const response = await api.get(`${ENDPOINTS.COMPLAINTS}/${id}`);
    return response.data;
}

export async function updateComplaint(id, data) {
    if (DEMO_MODE) {
        return demoUpdateComplaint(id, data);
    }
    const response = await api.put(`${ENDPOINTS.COMPLAINTS}/${id}`, data);
    return response.data;
}

export async function getComplaintsStats() {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    total: plaintesData.length,
                    ouvertes: plaintesData.filter(p => p.statut === 'ouverte').length,
                    en_traitement: plaintesData.filter(p => p.statut === 'en_traitement').length,
                    resolues: plaintesData.filter(p => p.statut === 'resolue').length,
                    critiques: plaintesData.filter(p => p.priorite === 'haute' && p.statut !== 'resolue').length
                });
            }, 200);
        });
    }
    const response = await api.get(`${ENDPOINTS.COMPLAINTS}/stats`);
    return response.data;
}
