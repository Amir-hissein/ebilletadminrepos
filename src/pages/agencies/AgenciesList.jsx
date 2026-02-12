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
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
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
    const [deleteModal, setDeleteModal] = useState({ open: false, agencyId: null, agencyName: '' });

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

    const confirmDelete = async () => {
        try {
            await deleteAgency(deleteModal.agencyId);
            setDeleteModal({ open: false, agencyId: null, agencyName: '' });
            loadAgencies();
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const handleDeleteClick = (agency) => {
        setDeleteModal({
            open: true,
            agencyId: agency.id,
            agencyName: agency.nom
        });
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
        <div className={styles.enterprise_container}>
            <header className={styles.agencies_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Gestion des Agences</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Partenariats Actifs</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_primary_pro} onClick={() => navigate('/agencies/new')}>
                        <Plus size={16} />
                        <span>Nouvelle Agence</span>
                    </button>
                </div>
            </header>

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

            <div className={styles.agencies_filters_pro}>
                <div className={styles.search_group_pro}>
                    <Search size={18} className={styles.search_icon_pro} />
                    <input
                        type="text"
                        placeholder="Rechercher une agence, adresse ou téléphone..."
                        className={styles.search_input_pro}
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className={styles.filter_group_pro}>
                    <select
                        className={styles.select_compact}
                        value={filters.statut}
                        onChange={handleStatusChange}
                    >
                        <option value="">Tous les statuts</option>
                        {Object.entries(AGENCY_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className={styles.agencies_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    {loading ? (
                        <div className={styles.agencies__loading}>
                            Chargement des agences...
                        </div>
                    ) : agencies.length === 0 ? (
                        <div className={styles.empty_state_container_pro}>
                            <div className={styles.empty_state_icon_pro}>
                                <Search size={40} />
                            </div>
                            <h3>Aucune agence trouvée</h3>
                            <p>Nous n'avons trouvé aucun partenaire correspondant à "<strong>{filters.search || 'votre recherche'}</strong>".</p>
                            <button
                                className={styles.reset_filters_btn_pro}
                                onClick={() => setFilters({ search: '', statut: '', sortBy: 'nom', sortOrder: 'asc' })}
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        <table className={styles.agencies_table_pro}>
                            <thead>
                                <tr>
                                    <th>Partenaire Agence</th>
                                    <th>Information Contact</th>
                                    <th>État</th>
                                    <th>Flotte</th>
                                    <th>Performance</th>
                                    <th>Revenus</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencies.map(agency => (
                                    <tr key={agency.id}>
                                        <td>
                                            <div className={styles.agency_identity_cell}>
                                                <div className={styles.agencies__avatar}>
                                                    <Building2 size={20} />
                                                </div>
                                                <div className={styles.agency_meta_info}>
                                                    <span className={styles.agency_full_name}>{agency.nom}</span>
                                                    <span className={styles.agency_address_sub}>{agency.adresse}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.agency_meta_info}>
                                                <span className={styles.mono_text}>{agency.telephone}</span>
                                                <span className={styles.agency_address_sub}>{agency.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles[`status_pill_${getStatusVariant(agency.statut)}`]}>
                                                {AGENCY_STATUS_LABELS[agency.statut]}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.mono_text}>
                                                <Bus size={14} style={{ marginRight: '4px' }} />
                                                {agency.nombre_vehicules}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.mono_text}>
                                                <TrendingUp size={14} style={{ marginRight: '4px' }} />
                                                {agency.nombre_voyages_mois}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.revenue_cell_pro}>
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
                                                <span className={styles.agency_address_sub}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.agency_actions_pro}>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/agencies/${agency.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/agencies/${agency.id}/edit`)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className={styles.relative} ref={openMenuId === agency.id ? menuRef : null}>
                                                    <button
                                                        className={`${styles.action_btn_pro} ${openMenuId === agency.id ? styles.active : ''}`}
                                                        onClick={() => toggleMenu(agency.id)}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openMenuId === agency.id && (
                                                        <div className={styles.dropdown_pro}>
                                                            <button onClick={() => handleStatusToggle(agency)}>
                                                                {agency.statut === 'actif' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                                {agency.statut === 'actif' ? 'Suspendre' : 'Activer'}
                                                            </button>
                                                            <button className={styles.danger} onClick={() => handleDeleteClick(agency)}>
                                                                <Trash2 size={14} />
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
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, agencyId: null, agencyName: '' })}
                onConfirm={confirmDelete}
                title="Supprimer l'agence"
                message={`Êtes-vous sûr de vouloir supprimer définitivement l'agence "${deleteModal.agencyName}" ? Cette action supprimera tous les voyages associés.`}
                confirmLabel="Supprimer définitivement"
            />
        </div>
    );
}

export default AgenciesList;
