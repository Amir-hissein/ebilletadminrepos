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
        <div className={styles.reservations}>
            {/* Header */}
            <div className={styles.reservations__header}>
                <div>
                    <h1 className={styles.reservations__title}>Gestion des Réservations</h1>
                    <p className={styles.reservations__subtitle}>
                        Suivez toutes les réservations de la plateforme
                    </p>
                </div>
                <Button icon={Plus} onClick={() => navigate('/reservations/new')}>
                    Nouvelle réservation
                </Button>
            </div>

            {/* Stats Cards */}
            <div className={styles.reservations__stats}>
                <div className={styles['reservations__stat-card']}>
                    <div className={`${styles['reservations__stat-icon']} ${styles['reservations__stat-icon--total']}`}>
                        <Ticket size={20} />
                    </div>
                    <span className={styles['reservations__stat-value']}>{stats.total || 0}</span>
                    <span className={styles['reservations__stat-label']}>Total réservations</span>
                </div>
                <div className={styles['reservations__stat-card']}>
                    <div className={`${styles['reservations__stat-icon']} ${styles['reservations__stat-icon--confirmed']}`}>
                        <CheckCircle size={20} />
                    </div>
                    <span className={styles['reservations__stat-value']}>{stats.confirmee || 0}</span>
                    <span className={styles['reservations__stat-label']}>Confirmées</span>
                </div>
                <div className={styles['reservations__stat-card']}>
                    <div className={`${styles['reservations__stat-icon']} ${styles['reservations__stat-icon--pending']}`}>
                        <Clock size={20} />
                    </div>
                    <span className={styles['reservations__stat-value']}>{stats.en_attente || 0}</span>
                    <span className={styles['reservations__stat-label']}>En attente</span>
                </div>
                <div className={styles['reservations__stat-card']}>
                    <div className={`${styles['reservations__stat-icon']} ${styles['reservations__stat-icon--revenue']}`}>
                        <DollarSign size={20} />
                    </div>
                    <span className={styles['reservations__stat-value']}>
                        {formatCurrency(stats.montant_total || 0)}
                    </span>
                    <span className={styles['reservations__stat-label']}>Revenus totaux</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.reservations__filters}>
                <div className={styles.reservations__search}>
                    <Search size={18} className={styles['reservations__search-icon']} />
                    <input
                        type="text"
                        placeholder="Rechercher par code, client, téléphone..."
                        className={styles['reservations__search-input']}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <select
                    className={styles['reservations__filter-select']}
                    value={filters.statut}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    className={styles['reservations__filter-select']}
                    value={filters.statut_paiement}
                    onChange={(e) => handleFilterChange('statut_paiement', e.target.value)}
                >
                    <option value="">Tous les paiements</option>
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className={styles['reservations__table-container']}>
                {loading ? (
                    <div className={styles.reservations__loading}>
                        Chargement des réservations...
                    </div>
                ) : reservations.length === 0 ? (
                    <div className={styles.reservations__empty}>
                        <div className={styles['reservations__empty-icon']}>
                            <Ticket size={32} />
                        </div>
                        <p>Aucune réservation trouvée</p>
                    </div>
                ) : (
                    <table className={styles.reservations__table}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Client</th>
                                <th>Voyage</th>
                                <th>Places</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Paiement</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(reservation => (
                                <tr key={reservation.id}>
                                    <td>
                                        <span className={styles.reservations__code}>
                                            {reservation.code_reservation}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles['reservations__client-cell']}>
                                            <div className={styles['reservations__client-info']} style={{ overflow: 'hidden' }}>
                                                <span className={`${styles['reservations__client-name']} truncate`} title={reservation.client_nom}>
                                                    {reservation.client_nom}
                                                </span>
                                                <span className={`${styles['reservations__client-email']} truncate`} title={reservation.client_email}>
                                                    {reservation.client_email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.reservations__voyage}>
                                            <div className={styles['reservations__voyage-route']}>
                                                <span>{reservation.voyage?.ville_depart_nom}</span>
                                                <ArrowRight size={14} className={styles['reservations__voyage-route-arrow']} />
                                                <span>{reservation.voyage?.ville_arrivee_nom}</span>
                                            </div>
                                            <span className={styles['reservations__voyage-date']}>
                                                <Calendar size={12} style={{ marginRight: '4px' }} />
                                                {formatDate(reservation.voyage?.date_depart)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.reservations__places}>
                                            {reservation.nombre_places}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.reservations__montant}>
                                            {formatCurrency(reservation.montant_total)}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge variant={getStatusVariant(reservation.statut)}>
                                            {RESERVATION_STATUS_LABELS[reservation.statut]}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge variant={getPaymentStatusVariant(reservation.statut_paiement)} size="sm">
                                            {PAYMENT_STATUS_LABELS[reservation.statut_paiement]}
                                        </Badge>
                                    </td>
                                    <td>
                                        <span className={styles.reservations__date}>
                                            {formatDate(reservation.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.reservations__actions}>
                                            <button
                                                className={styles['reservations__action-btn']}
                                                onClick={() => navigate(`/reservations/${reservation.id}`)}
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {reservation.statut === 'en_attente' && (
                                                <>
                                                    <button
                                                        className={`${styles['reservations__action-btn']} ${styles['reservations__action-btn--success']}`}
                                                        title="Confirmer"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        className={`${styles['reservations__action-btn']} ${styles['reservations__action-btn--danger']}`}
                                                        title="Annuler"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className={styles['reservations__action-btn']}
                                                title="Plus d'options"
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
    );
}

export default ReservationsList;
