// ============================================
// API VOYAGES - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS, TRIP_STATUS } from '../utils/constants';
import {
    DEMO_VOYAGES,
    DEMO_VILLES,
    getAgenceById,
    getVilleNom,
    getUtilisateurById,
    enrichVoyage
} from './database.demo';

// Mode démo activé (pas de backend)
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let voyagesData = [...DEMO_VOYAGES];

// ============================================
// FONCTIONS DÉMO
// ============================================

export function demoGetVoyages(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...voyagesData];

            // Filtre par agence
            if (filters.agence_id) {
                result = result.filter(v => v.agence_id === parseInt(filters.agence_id));
            }

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(v => v.statut === filters.statut);
            }

            // Filtre par type de transport
            if (filters.type_transport) {
                result = result.filter(v => v.type_transport === filters.type_transport);
            }

            // Filtre par ville de départ
            if (filters.ville_depart_id) {
                result = result.filter(v => v.ville_depart_id === parseInt(filters.ville_depart_id));
            }

            // Filtre par ville d'arrivée
            if (filters.ville_arrivee_id) {
                result = result.filter(v => v.ville_arrivee_id === parseInt(filters.ville_arrivee_id));
            }

            // Filtre par date
            if (filters.date_depart) {
                result = result.filter(v => v.date_depart === filters.date_depart);
            }

            // Filtre par plage de dates
            if (filters.date_debut && filters.date_fin) {
                result = result.filter(v =>
                    v.date_depart >= filters.date_debut &&
                    v.date_depart <= filters.date_fin
                );
            }

            // Recherche par numéro de vol/bus
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(v =>
                    v.numero_vol_bus?.toLowerCase().includes(search) ||
                    getVilleNom(v.ville_depart_id).toLowerCase().includes(search) ||
                    getVilleNom(v.ville_arrivee_id).toLowerCase().includes(search)
                );
            }

            // Enrichir avec les relations
            result = result.map(enrichVoyage);

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 10
            });
        }, 300);
    });
}

function demoGetVoyageById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const voyage = voyagesData.find(v => v.id === parseInt(id));
            if (voyage) {
                resolve(enrichVoyage(voyage));
            } else {
                reject(new Error('Voyage non trouvé'));
            }
        }, 200);
    });
}

function demoCreateVoyage(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newVoyage = {
                id: voyagesData.length + 1,
                agence_id: data.agence_id,
                ville_depart_id: data.ville_depart_id,
                ville_arrivee_id: data.ville_arrivee_id,
                date_depart: data.date_depart,
                heure_depart: data.heure_depart,
                date_arrivee: data.date_arrivee || data.date_depart,
                heure_arrivee: data.heure_arrivee,
                prix_unitaire: data.prix_unitaire,
                places_totales: data.places_totales,
                places_disponibles: data.places_totales,
                type_transport: data.type_transport,
                numero_vol_bus: data.numero_vol_bus,
                statut: TRIP_STATUS.PLANNED || 'planifie',
                description: data.description || '',
                created_by: data.created_by || 1,
                validated_by: null,
                validated_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            voyagesData.push(newVoyage);
            resolve(enrichVoyage(newVoyage));
        }, 500);
    });
}

function demoUpdateVoyage(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = voyagesData.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                voyagesData[index] = {
                    ...voyagesData[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };
                resolve(enrichVoyage(voyagesData[index]));
            } else {
                reject(new Error('Voyage non trouvé'));
            }
        }, 500);
    });
}

function demoUpdateVoyageStatus(id, statut) {
    return demoUpdateVoyage(id, { statut });
}

// ============================================
// EXPORTS API - VOYAGES
// ============================================

export async function getVoyages(filters = {}) {
    if (DEMO_MODE) {
        return demoGetVoyages(filters);
    }
    const response = await api.get(ENDPOINTS.TRIPS, { params: filters });
    return response.data;
}

export async function getVoyageById(id) {
    if (DEMO_MODE) {
        return demoGetVoyageById(id);
    }
    const response = await api.get(`${ENDPOINTS.TRIPS}/${id}`);
    return response.data;
}

export async function createVoyage(data) {
    if (DEMO_MODE) {
        return demoCreateVoyage(data);
    }
    const response = await api.post(ENDPOINTS.TRIPS, data);
    return response.data;
}

export async function updateVoyage(id, data) {
    if (DEMO_MODE) {
        return demoUpdateVoyage(id, data);
    }
    const response = await api.put(`${ENDPOINTS.TRIPS}/${id}`, data);
    return response.data;
}

export async function updateVoyageStatus(id, statut) {
    if (DEMO_MODE) {
        return demoUpdateVoyageStatus(id, statut);
    }
    const response = await api.patch(`${ENDPOINTS.TRIPS}/${id}/status`, { statut });
    return response.data;
}

export async function deleteVoyage(id) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                voyagesData = voyagesData.filter(v => v.id !== parseInt(id));
                resolve({ success: true });
            }, 500);
        });
    }
    const response = await api.delete(`${ENDPOINTS.TRIPS}/${id}`);
    return response.data;
}

// Statistiques des voyages
export async function getVoyagesStats(filters = {}) {
    if (DEMO_MODE) {
        // En mode démo, on réutilise la logique de filtrage de getVoyages mais pour les stats
        const result = await demoGetVoyages({ ...filters, limit: 1000 });
        const data = result.data;

        return {
            total: data.length,
            planifie: data.filter(v => v.statut === 'planifie').length,
            en_cours: data.filter(v => v.statut === 'en_cours').length,
            termine: data.filter(v => v.statut === 'termine').length,
            annule: data.filter(v => v.statut === 'annule').length,
            places_totales: data.reduce((sum, v) => sum + v.places_totales, 0),
            places_disponibles: data.reduce((sum, v) => sum + v.places_disponibles, 0)
        };
    }
    const response = await api.get(`${ENDPOINTS.TRIPS}/stats`, { params: filters });
    return response.data;
}

// ============================================
// EXPORTS API - VILLES
// ============================================

export async function getVilles(filters = {}) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let result = [...DEMO_VILLES];

                if (filters.actif !== undefined) {
                    result = result.filter(v => v.actif === filters.actif);
                }

                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    result = result.filter(v => v.nom.toLowerCase().includes(search));
                }

                resolve({ data: result, total: result.length });
            }, 100);
        });
    }
    const response = await api.get(ENDPOINTS.CITIES, { params: filters });
    return response.data;
}
