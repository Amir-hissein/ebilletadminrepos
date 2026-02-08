import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    Edit,
    MoreVertical,
    MapPin,
    ArrowRight,
    Bus,
    Plane,
    Calendar,
    Clock,
    Building2
} from 'lucide-react';
import { getVoyages, getVoyagesStats, getVilles } from '../../api/voyages.api';
import { TRIP_STATUS_LABELS, TRANSPORT_TYPES_LABELS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import styles from './VoyagesList.module.css';

function VoyagesList() {
    const navigate = useNavigate();
    const [voyages, setVoyages] = useState([]);
    const [villes, setVilles] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        statut: '',
        ville_depart_id: '',
        type_transport: '',
        date_depart: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [voyagesResult, statsResult, villesResult] = await Promise.all([
                getVoyages(filters),
                getVoyagesStats(),
                getVilles({ actif: true })
            ]);
            setVoyages(voyagesResult.data);
            setStats(statsResult);
            setVilles(villesResult.data);
        } catch (error) {
            console.error('Erreur chargement voyages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getStatusVariant = (statut) => {
        const variants = {
            planifie: 'primary',
            en_cours: 'warning',
            termine: 'success',
            annule: 'danger'
        };
        return variants[statut] || 'neutral';
    };

    const getPlacesFillClass = (disponibles, totales) => {
        const ratio = disponibles / totales;
        if (ratio >= 0.5) return styles['voyages__places-fill--high'];
        if (ratio >= 0.2) return styles['voyages__places-fill--medium'];
        return styles['voyages__places-fill--low'];
    };

    const TransportIcon = ({ type }) => {
        return type === 'avion' ? <Plane size={14} /> : <Bus size={14} />;
    };

    return (
        <div className={styles.voyages}>
            {/* Header */}
            <div className={styles.voyages__header}>
                <div>
                    <h1 className={styles.voyages__title}>Gestion des Voyages</h1>
                    <p className={styles.voyages__subtitle}>
                        Gérez tous les voyages et trajets de la plateforme
                    </p>
                </div>
                <Button icon={Plus} onClick={() => navigate('/voyages/new')}>
                    Nouveau voyage
                </Button>
            </div>

            {/* Stats Bar */}
            <div className={styles.voyages__stats}>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.total || 0}</span>
                    <span className={styles['voyages__stat-label']}>Total</span>
                </div>
                <div className={styles.voyages__stat}>
                    <Badge variant="primary" size="sm">{stats.planifie || 0}</Badge>
                    <span className={styles['voyages__stat-label']}>Planifiés</span>
                </div>
                <div className={styles.voyages__stat}>
                    <Badge variant="warning" size="sm">{stats.en_cours || 0}</Badge>
                    <span className={styles['voyages__stat-label']}>En cours</span>
                </div>
                <div className={styles.voyages__stat}>
                    <Badge variant="success" size="sm">{stats.termine || 0}</Badge>
                    <span className={styles['voyages__stat-label']}>Terminés</span>
                </div>
                <div className={styles.voyages__stat}>
                    <Badge variant="danger" size="sm">{stats.annule || 0}</Badge>
                    <span className={styles['voyages__stat-label']}>Annulés</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.voyages__filters}>
                <div className={styles.voyages__search}>
                    <Search size={18} className={styles['voyages__search-icon']} />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro, ville..."
                        className={styles['voyages__search-input']}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <select
                    className={styles['voyages__filter-select']}
                    value={filters.statut}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    className={styles['voyages__filter-select']}
                    value={filters.ville_depart_id}
                    onChange={(e) => handleFilterChange('ville_depart_id', e.target.value)}
                >
                    <option value="">Toutes les villes de départ</option>
                    {villes.map(ville => (
                        <option key={ville.id} value={ville.id}>{ville.nom}</option>
                    ))}
                </select>

                <select
                    className={styles['voyages__filter-select']}
                    value={filters.type_transport}
                    onChange={(e) => handleFilterChange('type_transport', e.target.value)}
                >
                    <option value="">Tous les transports</option>
                    {Object.entries(TRANSPORT_TYPES_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <input
                    type="date"
                    className={styles['voyages__filter-date']}
                    value={filters.date_depart}
                    onChange={(e) => handleFilterChange('date_depart', e.target.value)}
                />
            </div>

            {/* Table */}
            <div className={styles['voyages__table-container']}>
                {loading ? (
                    <div className={styles.voyages__loading}>
                        Chargement des voyages...
                    </div>
                ) : voyages.length === 0 ? (
                    <div className={styles.voyages__empty}>
                        <div className={styles['voyages__empty-icon']}>
                            <MapPin size={32} />
                        </div>
                        <p>Aucun voyage trouvé</p>
                    </div>
                ) : (
                    <table className={styles.voyages__table}>
                        <thead>
                            <tr>
                                <th>Trajet</th>
                                <th>Transport</th>
                                <th>Départ</th>
                                <th>Places</th>
                                <th>Prix</th>
                                <th>Agence</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {voyages.map(voyage => (
                                <tr key={voyage.id}>
                                    <td>
                                        <div className={styles.voyages__route}>
                                            <span className={`${styles['voyages__route-ville']} truncate`} title={voyage.ville_depart_nom}>
                                                {voyage.ville_depart_nom}
                                            </span>
                                            <ArrowRight size={16} className={styles['voyages__route-arrow']} />
                                            <span className={`${styles['voyages__route-ville']} truncate`} title={voyage.ville_arrivee_nom}>
                                                {voyage.ville_arrivee_nom}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.voyages__transport} ${styles[`voyages__transport--${voyage.type_transport}`]}`}>
                                            <TransportIcon type={voyage.type_transport} />
                                            {TRANSPORT_TYPES_LABELS[voyage.type_transport]}
                                            {voyage.numero_vol_bus && ` (${voyage.numero_vol_bus})`}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.voyages__datetime}>
                                            <span className={styles.voyages__date}>
                                                <Calendar size={12} style={{ marginRight: '4px' }} />
                                                {formatDate(voyage.date_depart)}
                                            </span>
                                            <span className={styles.voyages__time}>
                                                <Clock size={12} style={{ marginRight: '4px' }} />
                                                {voyage.heure_depart}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.voyages__places}>
                                            <span className={styles['voyages__places-text']}>
                                                {voyage.places_disponibles}/{voyage.places_totales}
                                            </span>
                                            <div className={styles['voyages__places-bar']}>
                                                <div
                                                    className={`${styles['voyages__places-fill']} ${getPlacesFillClass(voyage.places_disponibles, voyage.places_totales)}`}
                                                    style={{ width: `${(voyage.places_disponibles / voyage.places_totales) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.voyages__price}>
                                            {formatCurrency(voyage.prix_unitaire)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.voyages__agence}>
                                            <Building2 size={14} />
                                            {voyage.agence?.nom || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge variant={getStatusVariant(voyage.statut)}>
                                            {TRIP_STATUS_LABELS[voyage.statut]}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className={styles.voyages__actions}>
                                            <button
                                                className={styles['voyages__action-btn']}
                                                onClick={() => navigate(`/voyages/${voyage.id}`)}
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={styles['voyages__action-btn']}
                                                onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className={styles['voyages__action-btn']}
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

export default VoyagesList;
