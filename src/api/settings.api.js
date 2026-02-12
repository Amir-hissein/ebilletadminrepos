// ============================================
// API CONFIGURATION SYSTÈME - Paramètres Globaux
// ============================================

import api from './axios';
import { ENDPOINTS } from '../utils/constants';

// Mode démo activé
const DEMO_MODE = true;

// Valeurs par défaut pour la démo
let systemSettings = {
    platform: {
        name: "E-Billet Tchad",
        tagline: "Le futur de la billetterie au Tchad",
        email_contact: "contact@ebillet.td",
        phone_contact: "+235 60 00 00 00",
        address: "Avenue Charles de Gaulle, N'Djamena",
        logo_url: null,
        favicon_url: null
    },
    finance: {
        default_commission_rate: 10, // Pourcentage
        min_withdrawal_amount: 5000, // FCFA
        currency: "FCFA",
        tax_id: "TCH-2024-889"
    },
    system: {
        maintenance_mode: false,
        maintenance_message: "La plateforme est actuellement en maintenance pour amélioration. Merci de votre patience.",
        global_alert: null,
        registration_open: true,
        session_timeout: 60 // minutes
    },
    security: {
        two_factor_auth: false,
        password_expiry_days: 90,
        min_password_length: 8,
        active_sessions: [
            { id: 1, device: "Chrome / macOS", location: "N'Djamena, TD", last_active: "Maintenant", status: "active" },
            { id: 2, device: "iPhone 15 Pro", location: "Dubaï, AE", last_active: "Il y a 2h", status: "idle" }
        ],
        ip_whitelist: []
    },
    notifications: {
        email_new_reservation: true,
        email_weekly_report: true,
        sms_critical_alerts: true,
        push_new_ticket: true,
        payout_notification: true
    },
    appearance: {
        font_family: "Inter",
        border_radius: "12px",
        density: "comfortable"
    },
    audit_logs: [
        { id: 101, user: "Ali Mahamat", action: "Modif. Commission", timestamp: "2026-02-11T14:30:00Z" },
        { id: 102, user: "System", action: "Backup Quotidien", timestamp: "2026-02-11T03:00:00Z" },
        { id: 103, user: "Ali Mahamat", action: "Activation Maintenance", timestamp: "2026-02-10T22:15:00Z" }
    ],
    social: {
        facebook: "https://facebook.com/ebillet.td",
        twitter: "https://twitter.com/ebillet_td",
        whatsapp: "+235 90 00 00 00"
    }
};

// ============================================
// EXPORTS API
// ============================================

export async function getSettings() {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(systemSettings), 300);
        });
    }
    const response = await api.get(ENDPOINTS.SETTINGS || '/settings');
    return response.data;
}

export async function updateSettings(category, data) {
    if (DEMO_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                systemSettings = {
                    ...systemSettings,
                    [category]: {
                        ...systemSettings[category],
                        ...data
                    }
                };
                resolve(systemSettings[category]);
            }, 500);
        });
    }
    const response = await api.put(`${ENDPOINTS.SETTINGS || '/settings'}/${category}`, data);
    return response.data;
}

export async function toggleMaintenanceMode(enabled) {
    return updateSettings('system', { maintenance_mode: enabled });
}
