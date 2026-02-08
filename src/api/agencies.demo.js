import { AGENCY_STATUS_LABELS } from '../utils/constants';

// ============================================
// MODE DÉMO - Données fictives agences
// ============================================

export const DEMO_AGENCIES = [
    {
        id: 1,
        nom: 'Transport Express',
        adresse: 'Avenue Charles de Gaulle, N\'Djamena',
        telephone: '+235 66 00 11 22',
        email: 'contact@transportexpress.td',
        responsable_nom: 'Kamougue',
        responsable_prenom: 'Jean',
        responsable_telephone: '+235 66 00 11 23',
        statut: 'actif',
        taux_commission: 5.5,
        date_creation: '2024-01-15T10:00:00Z',
        nombre_vehicules: 12,
        nombre_voyages_mois: 45,
        revenus_mois: 4500000,
        note_moyenne: 4.5
    },
    {
        id: 2,
        nom: 'Voyage Sahel',
        adresse: 'Rue de Marché Central, N\'Djamena',
        telephone: '+235 66 00 22 33',
        email: 'info@voyagesahel.td',
        responsable_nom: 'Ibrahim',
        responsable_prenom: 'Moussa',
        responsable_telephone: '+235 66 00 22 34',
        statut: 'actif',
        taux_commission: 5.0,
        date_creation: '2023-08-20T10:00:00Z',
        nombre_vehicules: 8,
        nombre_voyages_mois: 32,
        revenus_mois: 3200000,
        note_moyenne: 4.2
    },
    {
        id: 3,
        nom: 'Trans Tchad',
        adresse: 'Quartier Moursal, N\'Djamena',
        telephone: '+235 66 00 33 44',
        email: 'contact@transtchad.td',
        responsable_nom: 'Brahim',
        responsable_prenom: 'Saleh',
        responsable_telephone: '+235 66 00 33 45',
        statut: 'suspendu',
        taux_commission: 5.5,
        date_creation: '2022-05-10T10:00:00Z',
        nombre_vehicules: 15,
        nombre_voyages_mois: 0,
        revenus_mois: 0,
        note_moyenne: 3.8
    },
    {
        id: 4,
        nom: 'Express Bus Moundou',
        adresse: 'Avenue de la Liberté, Moundou',
        telephone: '+235 66 00 44 55',
        email: 'contact@expressbusmoundou.td',
        responsable_nom: 'Ngakoutou',
        responsable_prenom: 'Pierre',
        responsable_telephone: '+235 66 00 44 56',
        statut: 'actif',
        taux_commission: 6.0,
        date_creation: '2024-03-01T10:00:00Z',
        nombre_vehicules: 6,
        nombre_voyages_mois: 28,
        revenus_mois: 2100000,
        note_moyenne: 4.7
    },
    {
        id: 5,
        nom: 'Sahara Transport',
        adresse: 'Rue Principale, Abéché',
        telephone: '+235 66 00 55 66',
        email: 'info@saharatransport.td',
        responsable_nom: 'Mahamat',
        responsable_prenom: 'Idriss',
        responsable_telephone: '+235 66 00 55 67',
        statut: 'en_attente',
        taux_commission: 5.5,
        date_creation: '2026-01-28T10:00:00Z',
        nombre_vehicules: 4,
        nombre_voyages_mois: 0,
        revenus_mois: 0,
        note_moyenne: 0
    },
    {
        id: 6,
        nom: 'Lac Tchad Voyages',
        adresse: 'Bol, Région du Lac',
        telephone: '+235 66 00 66 77',
        email: 'contact@lactchadv.td',
        responsable_nom: 'Oumar',
        responsable_prenom: 'Abakar',
        responsable_telephone: '+235 66 00 66 78',
        statut: 'actif',
        taux_commission: 5.0,
        date_creation: '2023-11-15T10:00:00Z',
        nombre_vehicules: 5,
        nombre_voyages_mois: 18,
        revenus_mois: 1350000,
        note_moyenne: 4.0
    }
];

// Simuler le fetch des agences avec filtres
export function demoGetAgencies(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...DEMO_AGENCIES];

            // Filtre par statut
            if (filters.statut) {
                result = result.filter(a => a.statut === filters.statut);
            }

            // Recherche par nom
            if (filters.search) {
                const search = filters.search.toLowerCase();
                result = result.filter(a =>
                    a.nom.toLowerCase().includes(search) ||
                    a.adresse.toLowerCase().includes(search)
                );
            }

            // Tri
            if (filters.sortBy) {
                result.sort((a, b) => {
                    const aVal = a[filters.sortBy];
                    const bVal = b[filters.sortBy];
                    const order = filters.sortOrder === 'desc' ? -1 : 1;
                    return aVal > bVal ? order : -order;
                });
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

// Simuler le fetch d'une agence par ID
export function demoGetAgencyById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const agency = DEMO_AGENCIES.find(a => a.id === parseInt(id));
            if (agency) {
                resolve(agency);
            } else {
                reject(new Error('Agence non trouvée'));
            }
        }, 200);
    });
}

// Simuler la création d'une agence
export function demoCreateAgency(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newAgency = {
                id: DEMO_AGENCIES.length + 1,
                ...data,
                statut: 'en_attente',
                date_creation: new Date().toISOString(),
                nombre_vehicules: 0,
                nombre_voyages_mois: 0,
                revenus_mois: 0,
                note_moyenne: 0
            };
            DEMO_AGENCIES.push(newAgency);
            resolve(newAgency);
        }, 500);
    });
}

// Simuler la mise à jour d'une agence
export function demoUpdateAgency(id, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = DEMO_AGENCIES.findIndex(a => a.id === parseInt(id));
            if (index !== -1) {
                DEMO_AGENCIES[index] = { ...DEMO_AGENCIES[index], ...data };
                resolve(DEMO_AGENCIES[index]);
            } else {
                reject(new Error('Agence non trouvée'));
            }
        }, 500);
    });
}

// Simuler le changement de statut
export function demoUpdateAgencyStatus(id, statut) {
    return demoUpdateAgency(id, { statut });
}
