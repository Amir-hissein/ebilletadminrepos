import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    Check,
    X,
    MoreVertical,
    Ticket,
    ArrowRight,
    Calendar,
    DollarSign,
    Users,
    CheckCircle,
    Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getReservations, getReservationsStats } from '../../api/reservations.api';
import {
    RESERVATION_STATUS_LABELS,
    PAYMENT_STATUS_LABELS
} from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import styles from './ReservationsList.module.css';

function ReservationsList() {
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        statut: '',
        statut_paiement: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reservationsResult, statsResult] = await Promise.all([
                getReservations(filters),
                getReservationsStats()
            ]);
            setReservations(reservationsResult.data);
            setStats(statsResult);
        } catch (error) {
            console.error('Erreur chargement réservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getStatusVariant = (statut) => {
        const variants = {
            en_attente: 'warning',
            confirmee: 'success',
            annulee: 'danger',
            remboursee: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    const getPaymentStatusVariant = (statut) => {
        const variants = {
            en_attente: 'warning',
            complete: 'success',
            echoue: 'danger',
            rembourse: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    return (
        <div className={styles.enterprise_container}>
            <header className={styles.reservations_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Gestion des Réservations</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système de Billetterie Live</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                {!isSuperAdmin && (
                    <div className={styles.global_actions}>
                        <button className={styles.btn_primary_pro} onClick={() => navigate('/reservations/new')}>
                            <Plus size={16} />
                            <span>Nouvelle Réservation</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Stats Cards */}
            <div className={styles.reservations_stats_pro}>
                <div className={styles.stat_card_pro}>
                    <div className={`${styles.stat_icon_pro} ${styles.icon_total}`}>
                        <Ticket size={24} />
                    </div>
                    <div className={styles.stat_info_pro}>
                        <span className={styles.stat_value_pro}>{stats.total || 0}</span>
                        <span className={styles.stat_label_pro}>Total réservations</span>
                    </div>
                </div>
                <div className={styles.stat_card_pro}>
                    <div className={`${styles.stat_icon_pro} ${styles.icon_confirmed}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.stat_info_pro}>
                        <span className={styles.stat_value_pro}>{stats.confirmee || 0}</span>
                        <span className={styles.stat_label_pro}>Confirmées</span>
                    </div>
                </div>
                <div className={styles.stat_card_pro}>
                    <div className={`${styles.stat_icon_pro} ${styles.icon_pending}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.stat_info_pro}>
                        <span className={styles.stat_value_pro}>{stats.en_attente || 0}</span>
                        <span className={styles.stat_label_pro}>En attente</span>
                    </div>
                </div>
                <div className={styles.stat_card_pro}>
                    <div className={`${styles.stat_icon_pro} ${styles.icon_revenue}`}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.stat_info_pro}>
                        <span className={styles.stat_value_pro}>
                            {formatCurrency(stats.montant_total || 0)}
                        </span>
                        <span className={styles.stat_label_pro}>Revenus totaux</span>
                    </div>
                </div>
            </div>

            <div className={styles.reservations_filters_pro}>
                <div className={styles.search_group_pro}>
                    <Search size={18} className={styles.search_icon_pro} />
                    <input
                        type="text"
                        placeholder="Rechercher par code PNR, nom client, email..."
                        className={styles.search_input_pro}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <select
                    className={styles.select_compact}
                    value={filters.statut}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    className={styles.select_compact}
                    value={filters.statut_paiement}
                    onChange={(e) => handleFilterChange('statut_paiement', e.target.value)}
                >
                    <option value="">Tous les paiements</option>
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className={styles.reservations_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    {loading ? (
                        <div className={styles.reservations__loading}>
                            Chargement du registre des réservations...
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className={styles.empty_state_container_pro}>
                            <div className={styles.empty_state_icon_pro}>
                                <Ticket size={40} />
                            </div>
                            <h3>Aucune réservation trouvée</h3>
                            <p>Nous n'avons trouvé aucun dossier correspondant à "<strong>{filters.search || 'votre recherche'}</strong>".</p>
                            <button
                                className={styles.reset_filters_btn_pro}
                                onClick={() => setFilters({ search: '', statut: '', statut_paiement: '' })}
                            >
                                Réinitialiser les dossiers
                            </button>
                        </div>
                    ) : (
                        <table className={styles.reservations_table_pro}>
                            <thead>
                                <tr>
                                    <th>Code PNR</th>
                                    <th>Client / Passager</th>
                                    <th>Trajet & Date</th>
                                    <th>Places</th>
                                    <th>Total</th>
                                    <th>Statut Dossier</th>
                                    <th>Paiement</th>
                                    <th>Date Émission</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(reservation => (
                                    <tr key={reservation.id}>
                                        <td>
                                            <span className={styles.reservation_code_cell}>
                                                {reservation.code_reservation}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.client_identity_cell}>
                                                <span className={`${styles.client_name_main} truncate`}>{reservation.client_nom}</span>
                                                <span className={`${styles.client_sub_info} truncate`}>{reservation.client_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.voyage_brief_cell}>
                                                <div className={styles.route_row}>
                                                    <span className="truncate">{reservation.voyage?.ville_depart_nom}</span>
                                                    <ArrowRight size={12} className={styles.route_arrow_eye} />
                                                    <span className="truncate">{reservation.voyage?.ville_arrivee_nom}</span>
                                                </div>
                                                <span className={styles.client_sub_info}>
                                                    {formatDate(reservation.voyage?.date_depart)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.mono_text}>
                                                {reservation.nombre_places}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.amount_cell_pro}>
                                                {formatCurrency(reservation.montant_total)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles[`status_pill_${getStatusVariant(reservation.statut)}`]}>
                                                {RESERVATION_STATUS_LABELS[reservation.statut]}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles[`status_pill_${getPaymentStatusVariant(reservation.statut_paiement)}`]}>
                                                {PAYMENT_STATUS_LABELS[reservation.statut_paiement]}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.client_sub_info}>
                                                {formatDate(reservation.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.reservation_actions_pro}>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/reservations/${reservation.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {!isSuperAdmin && reservation.statut === 'en_attente' && (
                                                    <>
                                                        <button
                                                            className={`${styles.action_btn_pro} ${styles.action_btn_success}`}
                                                            title="Confirmer"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className={`${styles.action_btn_pro} ${styles.action_btn_danger}`}
                                                            title="Annuler"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className={styles.action_btn_pro}
                                                    title="Options"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReservationsList;
