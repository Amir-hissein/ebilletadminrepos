import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    Edit,
    MoreVertical,
    Building2,
    Phone,
    Star,
    Bus,
    TrendingUp,
    CheckCircle,
    XCircle,
    Trash2,
    DollarSign,
    Clock
} from 'lucide-react';
import { getAgencies, updateAgencyStatus, deleteAgency } from '../../api/agencies.api';
import { AGENCY_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import styles from './AgenciesList.module.css';

function AgenciesList() {
    const navigate = useNavigate();
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);
    const [filters, setFilters] = useState({
        search: '',
        statut: '',
        sortBy: 'nom',
        sortOrder: 'asc'
    });

    // Stats calculées
    const stats = {
        total: agencies.length,
        actives: agencies.filter(a => a.statut === 'actif').length,
        suspendues: agencies.filter(a => a.statut === 'suspendu').length,
        enAttente: agencies.filter(a => a.statut === 'en_attente').length
    };

    useEffect(() => {
        loadAgencies();
    }, [filters]);

    const loadAgencies = async () => {
        setLoading(true);
        try {
            const result = await getAgencies(filters);
            setAgencies(result.data);
        } catch (error) {
            console.error('Erreur chargement agences:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fermer le menu quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (agencyId) => {
        setOpenMenuId(openMenuId === agencyId ? null : agencyId);
    };

    const handleStatusToggle = async (agency) => {
        const newStatus = agency.statut === 'actif' ? 'suspendu' : 'actif';
        try {
            await updateAgencyStatus(agency.id, newStatus);
            loadAgencies();
        } catch (error) {
            console.error('Erreur changement statut:', error);
        }
        setOpenMenuId(null);
    };

    const handleDelete = async (agency) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'agence "${agency.nom}" ?`)) {
            try {
                await deleteAgency(agency.id);
                loadAgencies();
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        setOpenMenuId(null);
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, statut: e.target.value }));
    };

    const getStatusVariant = (statut) => {
        const variants = {
            actif: 'success',
            suspendu: 'danger',
            en_attente: 'warning',
            inactif: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    return (
        <div className={styles.agencies}>
            {/* Header with Gradient */}
            <div className={styles.agencies__header}>
                <div className={styles['agencies__header-content']}>
                    <h1 className={styles.agencies__title}>Gestion des Agences</h1>
                    <p className={styles.agencies__subtitle}>
                        Gérez les agences de transport partenaires
                    </p>
                </div>
                <Button icon={Plus} onClick={() => navigate('/agencies/new')}>
                    Nouvelle agence
                </Button>
            </div>

            {/* Stats Cards */}
            <div className={styles.agencies__stats}>
                <div className={`${styles.agencies__stat} ${styles['agencies__stat--total']}`}>
                    <div className={`${styles['agencies__stat-icon']} ${styles['agencies__stat-icon--total']}`}>
                        <Building2 size={24} />
                    </div>
                    <div className={styles['agencies__stat-content']}>
                        <span className={styles['agencies__stat-value']}>{stats.total}</span>
                        <span className={styles['agencies__stat-label']}>Total</span>
                    </div>
                </div>
                <div className={`${styles.agencies__stat} ${styles['agencies__stat--active']}`}>
                    <div className={`${styles['agencies__stat-icon']} ${styles['agencies__stat-icon--active']}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles['agencies__stat-content']}>
                        <span className={styles['agencies__stat-value']}>{stats.actives}</span>
                        <span className={styles['agencies__stat-label']}>Actives</span>
                    </div>
                </div>
                <div className={`${styles.agencies__stat} ${styles['agencies__stat--suspended']}`}>
                    <div className={`${styles['agencies__stat-icon']} ${styles['agencies__stat-icon--suspended']}`}>
                        <XCircle size={24} />
                    </div>
                    <div className={styles['agencies__stat-content']}>
                        <span className={styles['agencies__stat-value']}>{stats.suspendues}</span>
                        <span className={styles['agencies__stat-label']}>Suspendues</span>
                    </div>
                </div>
                <div className={`${styles.agencies__stat} ${styles['agencies__stat--pending']}`}>
                    <div className={`${styles['agencies__stat-icon']} ${styles['agencies__stat-icon--pending']}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles['agencies__stat-content']}>
                        <span className={styles['agencies__stat-value']}>{stats.enAttente}</span>
                        <span className={styles['agencies__stat-label']}>En attente</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.agencies__filters}>
                <div className={styles.agencies__search}>
                    <Search size={18} className={styles['agencies__search-icon']} />
                    <input
                        type="text"
                        placeholder="Rechercher une agence..."
                        className={styles['agencies__search-input']}
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <select
                    className={styles['agencies__filter-select']}
                    value={filters.statut}
                    onChange={handleStatusChange}
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(AGENCY_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className={styles['agencies__table-container']}>
                {loading ? (
                    <div className={styles.agencies__loading}>
                        Chargement des agences...
                    </div>
                ) : agencies.length === 0 ? (
                    <div className={styles.agencies__empty}>
                        <div className={styles['agencies__empty-icon']}>
                            <Building2 size={32} />
                        </div>
                        <p>Aucune agence trouvée</p>
                    </div>
                ) : (
                    <div className={styles['agencies__table-wrapper']}>
                        <table className={styles.agencies__table}>
                            <thead>
                                <tr>
                                    <th>Agence</th>
                                    <th>Contact</th>
                                    <th>Statut</th>
                                    <th>Véhicules</th>
                                    <th>Voyages/mois</th>
                                    <th>Revenus/mois</th>
                                    <th>Note</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencies.map(agency => (
                                    <tr key={agency.id}>
                                        <td>
                                            <div className={styles['agencies__name-cell']}>
                                                <div className={styles['agencies__avatar']}>
                                                    <Building2 size={20} />
                                                </div>
                                                <div className={styles['agencies__name-info']}>
                                                    <span className={styles.agencies__name}>{agency.nom}</span>
                                                    <span className={styles.agencies__address}>{agency.adresse}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles['agencies__contact-cell']}>
                                                <div className={styles['agencies__contact-icon']}>
                                                    <Phone size={16} />
                                                </div>
                                                <div className={styles['agencies__contact-info']}>
                                                    <span className={styles.agencies__phone}>
                                                        {agency.telephone}
                                                    </span>
                                                    <span className={styles.agencies__email}>{agency.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={getStatusVariant(agency.statut)} dot>
                                                {AGENCY_STATUS_LABELS[agency.statut]}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className={styles['agencies__vehicles']}>
                                                <Bus size={16} />
                                                <span>{agency.nombre_vehicules}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles['agencies__trips']}>
                                                <TrendingUp size={14} />
                                                <span>{agency.nombre_voyages_mois}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles['agencies__revenue']}>
                                                <DollarSign size={14} />
                                                {formatCurrency(agency.revenus_mois)}
                                            </span>
                                        </td>

                                        <td>
                                            {agency.note_moyenne > 0 ? (
                                                <div className={styles.agencies__rating}>
                                                    <Star size={14} fill="currentColor" />
                                                    {agency.note_moyenne.toFixed(1)}
                                                </div>
                                            ) : (
                                                <span className={styles['agencies__no-rating']}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.agencies__actions}>
                                                <button
                                                    className={`${styles['agencies__action-btn']} ${styles['agencies__action-btn--view']}`}
                                                    onClick={() => navigate(`/agencies/${agency.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={`${styles['agencies__action-btn']} ${styles['agencies__action-btn--edit']}`}
                                                    onClick={() => navigate(`/agencies/${agency.id}/edit`)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className={styles['agencies__dropdown-wrapper']} ref={openMenuId === agency.id ? menuRef : null}>
                                                    <button
                                                        className={`${styles['agencies__action-btn']} ${styles['agencies__action-btn--more']} ${openMenuId === agency.id ? styles['agencies__action-btn--active'] : ''}`}
                                                        onClick={() => toggleMenu(agency.id)}
                                                        title="Plus d'options"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openMenuId === agency.id && (
                                                        <div className={styles['agencies__dropdown']}>
                                                            <button
                                                                className={styles['agencies__dropdown-item']}
                                                                onClick={() => handleStatusToggle(agency)}
                                                            >
                                                                {agency.statut === 'actif' ? (
                                                                    <>
                                                                        <XCircle size={16} />
                                                                        Suspendre
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle size={16} />
                                                                        Activer
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                className={`${styles['agencies__dropdown-item']} ${styles['agencies__dropdown-item--danger']}`}
                                                                onClick={() => handleDelete(agency)}
                                                            >
                                                                <Trash2 size={16} />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AgenciesList;
