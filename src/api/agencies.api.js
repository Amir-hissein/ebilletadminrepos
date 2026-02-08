// ============================================
// API AGENCES - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS } from '../utils/constants';
import {
    DEMO_AGENCES,
    DEMO_UTILISATEURS,
    getUtilisateurById
} from './database.demo';

// Mode démo activé (pas de backend)
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let agencesData = [...DEMO_AGENCES];

// ============================================
// FONCTIONS DÉMO
// ============================================

function enrichAgency(agence) {
    return {
        ...agence,
        created_by_user: getUtilisateurById(agence.created_by),
        validated_by_user: agence.validated_by ? getUtilisateurById(agence.validated_by) : null,
        // Calculer les stats (en mode démo)
        stats: {
            vehicules: Math.floor(Math.random() * 10) + 5,
            voyages_mois: Math.floor(Math.random() * 50) + 10,
            revenus_mois: Math.floor(Math.random() * 5000000) + 1000000,
            note: (Math.random() * 2 + 3).toFixed(1)
        }
    };
}

function demoGetAgencies(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...agencesData];

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(a => a.statut === filters.statut);
            }

            // Filtre par type de service
            if (filters.type_service) {
                result = result.filter(a => a.type_service === filters.type_service);
            }

            // Filtre par ville
            if (filters.ville) {
                result = result.filter(a => a.ville.toLowerCase().includes(filters.ville.toLowerCase()));
            }

            // Recherche par nom
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(a =>
                    a.nom.toLowerCase().includes(search) ||
                    a.email?.toLowerCase().includes(search) ||
                    a.ville.toLowerCase().includes(search)
                );
            }

            // Enrichir avec les relations
            result = result.map(enrichAgency);

            resolve({
                data: result,
                total: result.length,
                page: filters.page || 1,
                limit: filters.limit || 10
            });
        }, 300);
    });
}

function demoGetAgencyById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const agence = agencesData.find(a => a.id === parseInt(id));
            if (agence) {
                resolve(enrichAgency(agence));
            } else {
                reject(new Error('Agence non trouvée'));
            }
        }, 200);
    });
}

function demoCreateAgency(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newAgence = {
                id: agencesData.length + 1,
                nom: data.nom,
                type_service: data.type_service || 'bus',
                adresse: data.adresse,
                ville: data.ville || "N'Djamena",
                telephone: data.telephone,
                email: data.email,
                numero_licence: null,
                logo: data.logo || null,
                statut: 'en_attente',
                commission_pourcentage: data.taux_commission || 10.00,
                created_by: 1, // Super Admin en démo
                validated_by: null,
                validated_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Données responsable (pour invitation)
                responsable: {
                    nom: data.responsable_nom,
                    prenom: data.responsable_prenom,
                    telephone: data.responsable_telephone,
                    email: data.responsable_email
                }
            };
            agencesData.push(newAgence);
            resolve(enrichAgency(newAgence));
        }, 500);
    });
}

function demoUpdateAgency(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = agencesData.findIndex(a => a.id === parseInt(id));
            if (index !== -1) {
                agencesData[index] = {
                    ...agencesData[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };
                resolve(enrichAgency(agencesData[index]));
            } else {
                reject(new Error('Agence non trouvée'));
            }
        }, 500);
    });
}

function demoUpdateAgencyStatus(id, statut, validateur_id = 1) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = agencesData.findIndex(a => a.id === parseInt(id));
            if (index !== -1) {
                agencesData[index] = {
                    ...agencesData[index],
                    statut,
                    validated_by: ['active', 'suspendue'].includes(statut) ? validateur_id : agencesData[index].validated_by,
                    validated_at: ['active', 'suspendue'].includes(statut) ? new Date().toISOString() : agencesData[index].validated_at,
                    updated_at: new Date().toISOString()
                };
                resolve(enrichAgency(agencesData[index]));
            } else {
                reject(new Error('Agence non trouvée'));
            }
        }, 500);
    });
}

// ============================================
// EXPORTS API
// ============================================

export async function getAgencies(filters = {}) {
    if (DEMO_MODE) {
        return demoGetAgencies(filters);
    }
    const response = await api.get(ENDPOINTS.AGENCIES, { params: filters });
    return response.data;
}

export async function getAgencyById(id) {
    if (DEMO_MODE) {
        return demoGetAgencyById(id);
    }
    const response = await api.get(`${ENDPOINTS.AGENCIES}/${id}`);
    return response.data;
}

export async function createAgency(data) {
    if (DEMO_MODE) {
        return demoCreateAgency(data);
    }
    const response = await api.post(ENDPOINTS.AGENCIES, data);
    return response.data;
}

export async function updateAgency(id, data) {
    if (DEMO_MODE) {
        return demoUpdateAgency(id, data);
    }
    const response = await api.put(`${ENDPOINTS.AGENCIES}/${id}`, data);
    return response.data;
}

export async function updateAgencyStatus(id, statut) {
    if (DEMO_MODE) {
        return demoUpdateAgencyStatus(id, statut);
    }
    const response = await api.patch(`${ENDPOINTS.AGENCIES}/${id}/status`, { statut });
    return response.data;
}

export async function deleteAgency(id) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                agencesData = agencesData.filter(a => a.id !== parseInt(id));
                resolve({ success: true });
            }, 500);
        });
    }
    const response = await api.delete(`${ENDPOINTS.AGENCIES}/${id}`);
    return response.data;
}

// Statistiques des agences
export async function getAgenciesStats() {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    total: agencesData.length,
                    active: agencesData.filter(a => a.statut === 'active').length,
                    suspendue: agencesData.filter(a => a.statut === 'suspendue').length,
                    en_attente: agencesData.filter(a => a.statut === 'en_attente').length,
                    fermee: agencesData.filter(a => a.statut === 'fermee').length
                });
            }, 100);
        });
    }
    const response = await api.get(`${ENDPOINTS.AGENCIES}/stats`);
    return response.data;
}
