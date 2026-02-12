import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    Edit,
    MoreVertical,
    CheckCircle,
    XCircle,
    Trash2,
    Users as UsersIcon,
    UserCheck,
    ShieldAlert,
    ShieldCheck,
    Briefcase,
    Building2,
    Clock
} from 'lucide-react';
import { getUsers, updateUserStatus, deleteUser } from '../../api/users.api';
import { ROLES, ROLE_NAMES, USER_STATUS_LABELS } from '../../utils/constants';
import { formatDate, getInitials } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './UsersList.module.css';

function UsersList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);
    const [filters, setFilters] = useState({
        search: '',
        statut: '',
        role_id: ''
    });
    const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });

    // Stats calculées
    const stats = {
        total: users.length,
        actifs: users.filter(u => u.statut === 'actif').length,
        superAdmins: users.filter(u => u.role_id === ROLES.SUPER_ADMIN).length,
        sousAdmins: users.filter(u => [ROLES.SOUS_ADMIN_AGENCES, ROLES.SOUS_ADMIN_FINANCE].includes(u.role_id)).length,
        agenceUsers: users.filter(u => [ROLES.ADMIN_AGENCE, ROLES.AGENT_AGENCE].includes(u.role_id)).length
    };

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await getUsers(filters);
            setUsers(result.data);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
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

    const toggleMenu = (userId) => {
        setOpenMenuId(openMenuId === userId ? null : userId);
    };

    const handleStatusToggle = async (user) => {
        const newStatus = user.statut === 'actif' ? 'suspendu' : 'actif';
        try {
            await updateUserStatus(user.id, newStatus);
            loadUsers();
        } catch (error) {
            console.error('Erreur changement statut:', error);
        }
        setOpenMenuId(null);
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({ open: true, userId: user.id, userName: `${user.prenom} ${user.nom}` });
        setOpenMenuId(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteUser(deleteModal.userId);
            setDeleteModal({ open: false, userId: null, userName: '' });
            loadUsers();
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, statut: e.target.value }));
    };

    const handleRoleChange = (e) => {
        setFilters(prev => ({ ...prev, role_id: e.target.value }));
    };

    const getStatusVariant = (statut) => {
        const variants = {
            actif: 'success',
            suspendu: 'danger',
            inactif: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    const getRoleBadgeClass = (roleId) => {
        if (roleId === ROLES.SUPER_ADMIN) return styles['users__role-badge--super'];
        if ([ROLES.SOUS_ADMIN_AGENCES, ROLES.SOUS_ADMIN_FINANCE].includes(roleId)) {
            return styles['users__role-badge--sous-admin'];
        }
        if (roleId === ROLES.ADMIN_AGENCE) return styles['users__role-badge--admin-agence'];
        return styles['users__role-badge--agent'];
    };

    return (
        <div className={styles.enterprise_container}>
            <header className={styles.users_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Gestion des Utilisateurs</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système de Gestion Actif</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_primary_pro} onClick={() => navigate('/users/new')}>
                        <Plus size={16} />
                        <span>Nouvel Utilisateur</span>
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className={styles.users__stats}>
                <div className={`${styles.users__stat} ${styles['users__stat--total']}`}>
                    <div className={`${styles['users__stat-icon']} ${styles['users__stat-icon--total']}`}>
                        <UsersIcon size={24} />
                    </div>
                    <div className={styles['users__stat-content']}>
                        <span className={styles['users__stat-value']}>{stats.total}</span>
                        <span className={styles['users__stat-label']}>Total</span>
                    </div>
                </div>
                <div className={`${styles.users__stat} ${styles['users__stat--active']}`}>
                    <div className={`${styles['users__stat-icon']} ${styles['users__stat-icon--active']}`}>
                        <UserCheck size={24} />
                    </div>
                    <div className={styles['users__stat-content']}>
                        <span className={styles['users__stat-value']}>{stats.actifs}</span>
                        <span className={styles['users__stat-label']}>Actifs</span>
                    </div>
                </div>
                <div className={`${styles.users__stat} ${styles['users__stat--super']}`}>
                    <div className={`${styles['users__stat-icon']} ${styles['users__stat-icon--super']}`}>
                        <ShieldAlert size={24} />
                    </div>
                    <div className={styles['users__stat-content']}>
                        <span className={styles['users__stat-value']}>{stats.superAdmins}</span>
                        <span className={styles['users__stat-label']}>Super Admins</span>
                    </div>
                </div>
                <div className={`${styles.users__stat} ${styles['users__stat--admin']}`}>
                    <div className={`${styles['users__stat-icon']} ${styles['users__stat-icon--admin']}`}>
                        <ShieldCheck size={24} />
                    </div>
                    <div className={styles['users__stat-content']}>
                        <span className={styles['users__stat-value']}>{stats.sousAdmins}</span>
                        <span className={styles['users__stat-label']}>Sous-Admins</span>
                    </div>
                </div>
                <div className={`${styles.users__stat} ${styles['users__stat--agency']}`}>
                    <div className={`${styles['users__stat-icon']} ${styles['users__stat-icon--agency']}`}>
                        <Briefcase size={24} />
                    </div>
                    <div className={styles['users__stat-content']}>
                        <span className={styles['users__stat-value']}>{stats.agenceUsers}</span>
                        <span className={styles['users__stat-label']}>Agences</span>
                    </div>
                </div>
            </div>

            <div className={styles.users_filters_pro}>
                <div className={styles.search_group_pro}>
                    <Search size={18} className={styles.search_icon_pro} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur, email ou rôle..."
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
                        {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>

                    <select
                        className={styles.select_compact}
                        value={filters.role_id}
                        onChange={handleRoleChange}
                    >
                        <option value="">Tous les rôles</option>
                        {Object.entries(ROLE_NAMES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className={styles.users_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    {loading ? (
                        <div className={styles.users__loading}>
                            Chargement des utilisateurs...
                        </div>
                    ) : users.length === 0 ? (
                        <div className={styles.empty_state_container_pro}>
                            <div className={styles.empty_state_icon_pro}>
                                <Search size={40} />
                            </div>
                            <h3>Aucun utilisateur trouvé</h3>
                            <p>Nous n'avons trouvé aucun profil correspondant à "<strong>{filters.search || 'votre recherche'}</strong>".</p>
                            <button
                                className={styles.reset_filters_btn_pro}
                                onClick={() => setFilters({ search: '', statut: '', role_id: '' })}
                            >
                                Réinitialiser les paramètres
                            </button>
                        </div>
                    ) : (
                        <table className={styles.users_table_pro}>
                            <thead>
                                <tr>
                                    <th>Identité Utilisateur</th>
                                    <th>Rôle Système</th>
                                    <th>Agence / Affiliation</th>
                                    <th>État Compte</th>
                                    <th>Dernière Activité</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.user_identity_cell}>
                                                <div className={styles.users__avatar}>
                                                    {getInitials(user.prenom, user.nom)}
                                                </div>
                                                <div className={styles.user_meta_info}>
                                                    <span className={styles.user_full_name}>
                                                        {user.prenom} {user.nom}
                                                    </span>
                                                    <span className={styles.mono_email}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.role_badge_pro} ${getRoleBadgeClass(user.role_id)}`}>
                                                {ROLE_NAMES[user.role_id]}
                                            </span>
                                        </td>
                                        <td>
                                            {user.agence_nom ? (
                                                <div className={styles.users__agency} title={user.agence_nom}>
                                                    <Building2 size={14} style={{ flexShrink: 0 }} />
                                                    <span className="truncate">{user.agence_nom}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={user.statut === 'actif' ? styles.status_pill_success : styles.status_pill_pending}>
                                                {USER_STATUS_LABELS[user.statut]}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.last_login_cell}>
                                                {user.derniere_connexion ? (
                                                    <>
                                                        <Clock size={14} className={styles.clock_icon} />
                                                        <span className={styles.mono_text}>{formatDate(user.derniere_connexion)}</span>
                                                    </>
                                                ) : (
                                                    <span className={styles.never_text}>Jamais connecté</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.user_actions_pro}>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/users/${user.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={styles.action_btn_pro}
                                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className={styles.relative} ref={openMenuId === user.id ? menuRef : null}>
                                                    <button
                                                        className={`${styles.action_btn_pro} ${openMenuId === user.id ? styles.active : ''}`}
                                                        onClick={() => toggleMenu(user.id)}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openMenuId === user.id && (
                                                        <div className={styles.dropdown_pro}>
                                                            <button onClick={() => handleStatusToggle(user)}>
                                                                {user.statut === 'actif' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                                                {user.statut === 'actif' ? 'Suspendre' : 'Activer'}
                                                            </button>
                                                            <button className={styles.danger} onClick={() => handleDeleteClick(user)}>
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
                onClose={() => setDeleteModal({ open: false, userId: null, userName: '' })}
                onConfirm={confirmDelete}
                title="Supprimer l'utilisateur"
                message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${deleteModal.userName}" ? Cette action révoquera tous ses accès.`}
                confirmLabel="Supprimer définitivement"
            />
        </div>
    );
}

export default UsersList;
