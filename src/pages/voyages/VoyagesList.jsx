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
    Building2,
    Trash2
} from 'lucide-react';
import { getVoyages, getVoyagesStats, getVilles, deleteVoyage } from '../../api/voyages.api';
import { TRIP_STATUS_LABELS, TRANSPORT_TYPES_LABELS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
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
        ville_arrivee_id: '',
        type_transport: '',
        date_depart: ''
    });
    const [deleteModal, setDeleteModal] = useState({ open: false, voyageId: null, voyageRef: '' });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [voyagesResult, statsResult, villesResult] = await Promise.all([
                getVoyages(filters),
                getVoyagesStats(filters),
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

    const confirmDelete = async () => {
        try {
            await deleteVoyage(deleteModal.voyageId);
            setDeleteModal({ open: false, voyageId: null, voyageRef: '' });
            loadData();
        } catch (error) {
            console.error('Erreur suppression voyage:', error);
        }
    };

    const handleDeleteClick = (voyage) => {
        setDeleteModal({
            open: true,
            voyageId: voyage.id,
            voyageRef: voyage.numero_vol_bus || `#${voyage.id}`
        });
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
        <div className={styles.enterprise_container}>
            <header className={styles.voyages_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Gestion des Voyages</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Trafic en Temps Réel</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_primary_pro} onClick={() => navigate('/voyages/new')}>
                        <Plus size={16} />
                        <span>Planifier un Voyage</span>
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className={styles.voyages__stats}>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.total || 0}</span>
                    <span className={styles['voyages__stat-label']}>Total</span>
                </div>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.planifie || 0}</span>
                    <span className={styles['voyages__stat-label']}>Planifiés</span>
                </div>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.en_cours || 0}</span>
                    <span className={styles['voyages__stat-label']}>En cours</span>
                </div>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.termine || 0}</span>
                    <span className={styles['voyages__stat-label']}>Terminés</span>
                </div>
                <div className={styles.voyages__stat}>
                    <span className={styles['voyages__stat-value']}>{stats.annule || 0}</span>
                    <span className={styles['voyages__stat-label']}>Annulés</span>
                </div>
            </div>

            <div className={styles.voyages_filters_pro}>
                <div className={styles.search_group_pro}>
                    <Search size={18} className={styles.search_icon_pro} />
                    <input
                        type="text"
                        placeholder="Rechercher par trajet, ville ou numéro..."
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
                    <option value="">Statuts</option>
                    {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    className={styles.select_compact}
                    value={filters.ville_depart_id}
                    onChange={(e) => handleFilterChange('ville_depart_id', e.target.value)}
                >
                    <option value="">Départ</option>
                    {villes.map(ville => (
                        <option key={ville.id} value={ville.id}>{ville.nom}</option>
                    ))}
                </select>

                <select
                    className={styles.select_compact}
                    value={filters.ville_arrivee_id}
                    onChange={(e) => handleFilterChange('ville_arrivee_id', e.target.value)}
                >
                    <option value="">Arrivée</option>
                    {villes.map(ville => (
                        <option key={ville.id} value={ville.id}>{ville.nom}</option>
                    ))}
                </select>

                <select
                    className={styles.select_compact}
                    value={filters.type_transport}
                    onChange={(e) => handleFilterChange('type_transport', e.target.value)}
                >
                    <option value="">Transports</option>
                    {Object.entries(TRANSPORT_TYPES_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <input
                    type="date"
                    className={styles.date_input_compact}
                    value={filters.date_depart}
                    onChange={(e) => handleFilterChange('date_depart', e.target.value)}
                />
            </div>

            {/* Table */}
            <div className={styles.voyages_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    {loading ? (
                        <div className={styles.voyages__loading}>
                            Chargement des flux logistiques...
                        </div>
                    ) : voyages.length === 0 ? (
                        <div className={styles.empty_state_container_pro}>
                            <div className={styles.empty_state_icon_pro}>
                                <Search size={40} />
                            </div>
                            <h3>Aucun trajet trouvé</h3>
                            <p>Nous n'avons trouvé aucun voyage correspondant à "<strong>{filters.search || 'votre recherche'}</strong>".</p>
                            <button
                                className={styles.reset_filters_btn_pro}
                                onClick={() => setFilters({ search: '', statut: '', ville_depart_id: '', type_transport: '', date_depart: '' })}
                            >
                                Réinitialiser les flux
                            </button>
                        </div>
                    ) : (
                        <table className={styles.voyages_table_pro}>
                            <thead>
                                <tr>
                                    <th>Trajet Logistique</th>
                                    <th>Type & Ref</th>
                                    <th>Départ Prévu</th>
                                    <th>Capacité</th>
                                    <th>Tarification</th>
                                    <th>Opérateur</th>
                                    <th>État</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voyages.map(voyage => (
                                    <tr key={voyage.id}>
                                        <td>
                                            <div className={styles.voyage_route_cell}>
                                                <span className="truncate">{voyage.ville_depart_nom}</span>
                                                <ArrowRight size={14} className={styles.route_arrow_eye} />
                                                <span className="truncate">{voyage.ville_arrivee_nom}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.agency_meta_info}>
                                                <span className={styles.mono_text} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <TransportIcon type={voyage.type_transport} />
                                                    {TRANSPORT_TYPES_LABELS[voyage.type_transport]}
                                                </span>
                                                <span className={styles.agency_address_sub}>{voyage.numero_vol_bus || 'S/N'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.agency_meta_info}>
                                                <span className={styles.mono_text}>{formatDate(voyage.date_depart)}</span>
                                                <span className={styles.agency_address_sub}>{voyage.heure_depart}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.agency_meta_info}>
                                                <span className={styles.mono_text}>{voyage.places_disponibles}/{voyage.places_totales}</span>
                                                <div className={styles['voyages__places-bar']} style={{ marginTop: '4px' }}>
                                                    <div
                                                        className={`${styles['voyages__places-fill']} ${getPlacesFillClass(voyage.places_disponibles, voyage.places_totales)}`}
                                                        style={{ width: `${(voyage.places_disponibles / voyage.places_totales) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.price_cell_pro}>
                                                {formatCurrency(voyage.prix_unitaire)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.agency_address_sub}>
                                                {voyage.agence?.nom || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles[`status_pill_${getStatusVariant(voyage.statut)}`]}>
                                                {TRIP_STATUS_LABELS[voyage.statut]}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.voyage_actions_pro}>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/voyages/${voyage.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => handleDeleteClick(voyage)}
                                                    title="Supprimer"
                                                    style={{ color: 'var(--danger-500)' }}
                                                >
                                                    <Trash2 size={16} />
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

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, voyageId: null, voyageRef: '' })}
                onConfirm={confirmDelete}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer définitivement le voyage "${deleteModal.voyageRef}" ? Cette action est irréversible.`}
                confirmLabel="Supprimer définitivement"
            />
        </div>
    );
}

export default VoyagesList;
