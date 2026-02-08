// ============================================
// API ACTIONS CRITIQUES - Validation par Super Admin
// ============================================

import api from './axios';
import { ENDPOINTS, CRITICAL_ACTION_STATUS } from '../utils/constants';
import {
    DEMO_ACTIONS_CRITIQUES,
    getAgenceById,
    getUtilisateurById,
    DEMO_AGENCES
} from './database.demo';

// Mode démo activé
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let actionsData = [...DEMO_ACTIONS_CRITIQUES];

// ============================================
// FONCTIONS DÉMO
// ============================================

function enrichAction(action) {
    let entiteNom = 'Inconnue';

    // Enrichissement selon le type d'entité
    if (action.entite_type === 'agence') {
        const agence = getAgenceById(action.entite_id);
        entiteNom = agence ? agence.nom : `Agence #${action.entite_id}`;
    } else if (action.entite_type === 'utilisateur') {
        const user = getUtilisateurById(action.entite_id);
        entiteNom = user ? `${user.prenom} ${user.nom}` : `User #${action.entite_id}`;
    }

    return {
        ...action,
        demandeur: getUtilisateurById(action.demandeur_id),
        validateur: action.validateur_id ? getUtilisateurById(action.validateur_id) : null,
        entite_nom: entiteNom
    };
}

function demoGetCriticalActions(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...actionsData];

            // Filtre par statut (défaut: en_attente)
            if (filters.statut) {
                result = result.filter(a => a.statut === filters.statut);
            }

            // Enrichir
            result = result.map(enrichAction);

            // Tri par date (plus récent d'abord)
            result.sort((a, b) => new Date(b.date_demande) - new Date(a.date_demande));

            resolve({
                data: result,
                total: result.length
            });
        }, 300);
    });
}

function demoValidateAction(id, validateurId, motif = null) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = actionsData.findIndex(a => a.id === parseInt(id));
            if (index !== -1) {
                actionsData[index] = {
                    ...actionsData[index],
                    statut: CRITICAL_ACTION_STATUS.APPROVED,
                    validateur_id: validateurId,
                    date_traitement: new Date().toISOString()
                };

                // EFFETS DE BORD (Simulation)
                // Si l'action est de bloquer une agence, on met jour l'agence
                if (actionsData[index].type_action === 'bloquer_agence' && actionsData[index].entite_type === 'agence') {
                    const agenceIndex = DEMO_AGENCES.findIndex(a => a.id === actionsData[index].entite_id);
                    if (agenceIndex !== -1) {
                        // Note: Ceci modifie la référence importée, en vrai on appellerait une API
                        console.log(`Agence ${DEMO_AGENCES[agenceIndex].nom} suspendue via validation.`);
                    }
                }

                resolve(enrichAction(actionsData[index]));
            } else {
                reject(new Error('Action non trouvée'));
            }
        }, 400);
    });
}

function demoRejectAction(id, validateurId, motif) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = actionsData.findIndex(a => a.id === parseInt(id));
            if (index !== -1) {
                actionsData[index] = {
                    ...actionsData[index],
                    statut: CRITICAL_ACTION_STATUS.REJECTED,
                    validateur_id: validateurId,
                    motif_rejet: motif,
                    date_traitement: new Date().toISOString()
                };
                resolve(enrichAction(actionsData[index]));
            } else {
                reject(new Error('Action non trouvée'));
            }
        }, 400);
    });
}

// ============================================
// EXPORTS API
// ============================================

export async function getCriticalActions(filters = {}) {
    if (DEMO_MODE) {
        return demoGetCriticalActions(filters);
    }
    const response = await api.get(ENDPOINTS.CRITICAL_ACTIONS, { params: filters });
    return response.data;
}

export async function validateCriticalAction(id, validateurId) {
    if (DEMO_MODE) {
        return demoValidateAction(id, validateurId);
    }
    const response = await api.post(`${ENDPOINTS.CRITICAL_ACTIONS}/${id}/validate`);
    return response.data;
}

export async function rejectCriticalAction(id, validateurId, motif) {
    if (DEMO_MODE) {
        return demoRejectAction(id, validateurId, motif);
    }
    const response = await api.post(`${ENDPOINTS.CRITICAL_ACTIONS}/${id}/reject`, { motif });
    return response.data;
}
