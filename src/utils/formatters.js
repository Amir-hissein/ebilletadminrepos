import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount) {
    if (amount == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
}

/**
 * Formate une date en format français
 */
export function formatDate(dateString, formatStr = 'dd/MM/yyyy') {
    if (!dateString) return '—';
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
        return format(date, formatStr, { locale: fr });
    } catch {
        return dateString;
    }
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(dateString) {
    return formatDate(dateString, 'dd/MM/yyyy à HH:mm');
}

/**
 * Formate une heure
 */
export function formatTime(timeString) {
    if (!timeString) return '—';
    // Si c'est au format HH:mm:ss, extraire HH:mm
    if (timeString.includes(':')) {
        return timeString.split(':').slice(0, 2).join(':');
    }
    return timeString;
}

/**
 * Formate une date relative (il y a 2 heures, etc.)
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return '—';
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
        return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
        return dateString;
    }
}

/**
 * Formate un numéro de téléphone tchadien
 */
export function formatPhone(phone) {
    if (!phone) return '—';
    // Nettoyer le numéro
    const cleaned = phone.replace(/\D/g, '');
    // Format: +235 XX XX XX XX
    if (cleaned.startsWith('235')) {
        const number = cleaned.slice(3);
        return `+235 ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 6)} ${number.slice(6, 8)}`;
    }
    return phone;
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value, decimals = 0) {
    if (value == null) return '—';
    return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Génère les initiales d'un nom
 */
export function getInitials(firstName, lastName) {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '?';
}

/**
 * Formate un nom complet
 */
export function formatFullName(firstName, lastName) {
    return [firstName, lastName].filter(Boolean).join(' ') || '—';
}

/**
 * Tronque un texte
 */
export function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Formate le taux de remplissage
 */
export function formatOccupancy(available, total) {
    if (total == null || total === 0) return { percent: 0, label: '—' };
    const used = total - (available || 0);
    const percent = Math.round((used / total) * 100);
    return {
        percent,
        label: `${used}/${total} places (${percent}%)`
    };
}

/**
 * Formate le statut avec couleur
 */
export function getStatusConfig(status, type = 'default') {
    const configs = {
        // Statuts agence
        active: { label: 'Active', color: 'success' },
        suspendue: { label: 'Suspendue', color: 'warning' },
        fermee: { label: 'Fermée', color: 'danger' },

        // Statuts utilisateur
        actif: { label: 'Actif', color: 'success' },
        suspendu: { label: 'Suspendu', color: 'warning' },
        inactif: { label: 'Inactif', color: 'neutral' },

        // Statuts voyage
        planifie: { label: 'Planifié', color: 'primary' },
        en_cours: { label: 'En cours', color: 'warning' },
        termine: { label: 'Terminé', color: 'success' },
        annule: { label: 'Annulé', color: 'danger' },

        // Statuts paiement
        en_attente: { label: 'En attente', color: 'warning' },
        paye: { label: 'Payé', color: 'success' },
        rembourse: { label: 'Remboursé', color: 'primary' },

        // Statuts réservation
        confirmee: { label: 'Confirmée', color: 'success' },
        annulee: { label: 'Annulée', color: 'danger' },
        utilisee: { label: 'Utilisée', color: 'neutral' },

        // Statuts plainte
        ouverte: { label: 'Ouverte', color: 'danger' },
        en_traitement: { label: 'En traitement', color: 'warning' },
        resolue: { label: 'Résolue', color: 'success' },

        // Statuts action critique
        validee: { label: 'Validée', color: 'success' },
        rejetee: { label: 'Rejetée', color: 'danger' }
    };

    return configs[status] || { label: status, color: 'neutral' };
}
