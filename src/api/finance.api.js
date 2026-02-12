// ============================================
// API FINANCE - Aligné avec le schéma DB
// ============================================

import api from './axios';
import { ENDPOINTS } from '../utils/constants';
import {
    DEMO_TRANSACTIONS,
    DEMO_AGENCES,
    DEMO_RESERVATIONS,
    getAgenceById,
    enrichReservation
} from './database.demo';

// Mode démo activé
const DEMO_MODE = true;

// Copie mutable pour les opérations CRUD en démo
let transactionsData = [...DEMO_TRANSACTIONS];

// ============================================
// FONCTIONS HELPER
// ============================================

function enrichTransaction(transaction) {
    let beneficiaire_nom = 'Inconnu';

    if (transaction.beneficiaire_type === 'agence') {
        const agence = getAgenceById(transaction.beneficiaire_id);
        beneficiaire_nom = agence ? agence.nom : 'Agence inconnue';
    } else if (transaction.beneficiaire_type === 'plateforme') {
        beneficiaire_nom = 'E-Billet Plateforme';
    }

    // Trouver la réservation associée
    const reservation = DEMO_RESERVATIONS.find(r => r.id === transaction.reservation_id);
    const reservationEnriched = reservation ? enrichReservation(reservation) : null;

    return {
        ...transaction,
        beneficiaire_nom,
        reservation: reservationEnriched,
        reservation_code: reservationEnriched ? reservationEnriched.code_reservation : 'N/A'
    };
}

// ============================================
// FONCTIONS DÉMO
// ============================================

function demoGetTransactions(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let result = [...transactionsData];

            // Filtre par type transaction
            if (filters.type) {
                result = result.filter(t => t.type_transaction === filters.type);
            }

            // Filtre par agence (bénéficiaire)
            if (filters.agence_id) {
                result = result.filter(t =>
                    t.beneficiaire_type === 'agence' &&
                    t.beneficiaire_id === parseInt(filters.agence_id)
                );
            }

            // Filtre par date
            if (filters.date_debut && filters.date_fin) {
                result = result.filter(t =>
                    t.created_at >= filters.date_debut &&
                    t.created_at <= filters.date_fin
                );
            }

            // Enrichir
            result = result.map(enrichTransaction);

            // Filtre de recherche global
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                result = result.filter(t =>
                    (t.reference_paiement && t.reference_paiement.toLowerCase().includes(searchLower)) ||
                    (t.reservation_code && t.reservation_code.toLowerCase().includes(searchLower))
                );
            }

            // Tri par date
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

function demoGetFinanceStats(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let transactions = [...transactionsData];

            // Filtrer si nécessaire (par agence, date)
            if (filters.agence_id) {
                transactions = transactions.filter(t =>
                    t.beneficiaire_type === 'agence' &&
                    t.beneficiaire_id === parseInt(filters.agence_id)
                );
            }

            const totalRevenus = transactions
                .filter(t => t.type_transaction === 'paiement' && t.statut === 'completee')
                .reduce((sum, t) => sum + t.montant, 0);

            const totalCommissions = transactions
                .filter(t => t.type_transaction === 'commission' && t.statut === 'completee')
                .reduce((sum, t) => sum + t.montant, 0);

            // Données pour le graphique (revenus par mois)
            const revenueByMonth = [
                { name: 'Jan', revenus: 1500000, commissions: 150000 },
                { name: 'Fév', revenus: 2300000, commissions: 230000 },
                { name: 'Mar', revenus: 1800000, commissions: 180000 },
                { name: 'Avr', revenus: totalRevenus, commissions: totalCommissions }, // Mois courant (simulé)
            ];

            resolve({
                total_revenus: totalRevenus,
                total_commissions: totalCommissions,
                nombre_transactions: transactions.length,
                revenue_chart: revenueByMonth
            });
        }, 300);
    });
}

// ============================================
// EXPORTS API
// ============================================

export async function getTransactions(filters = {}) {
    if (DEMO_MODE) {
        return demoGetTransactions(filters);
    }
    const response = await api.get('/transactions', { params: filters });
    return response.data;
}

export async function getFinanceStats(filters = {}) {
    if (DEMO_MODE) {
        return demoGetFinanceStats(filters);
    }
    const response = await api.get('/finance/stats', { params: filters });
    return response.data;
}
