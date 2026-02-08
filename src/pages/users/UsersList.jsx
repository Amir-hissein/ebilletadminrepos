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

    const handleDelete = async (user) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`)) {
            try {
                await deleteUser(user.id);
                loadUsers();
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
        <div className={styles.users}>
            {/* Header */}
            <div className={styles.users__header}>
                <div className={styles['users__header-content']}>
                    <h1 className={styles.users__title}>Gestion des Utilisateurs</h1>
                    <p className={styles.users__subtitle}>
                        Gérez les utilisateurs de la plateforme, leurs rôles et accès
                    </p>
                </div>
                <div className={styles['users__header-content']}>
                    <Button icon={Plus} onClick={() => navigate('/users/new')}>
                        Nouvel utilisateur
                    </Button>
                </div>
            </div>

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

            {/* Filters */}
            <div className={styles.users__filters}>
                <div className={styles.users__search}>
                    <Search size={18} className={styles['users__search-icon']} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        className={styles['users__search-input']}
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <select
                    className={styles['users__filter-select']}
                    value={filters.statut}
                    onChange={handleStatusChange}
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                <select
                    className={styles['users__filter-select']}
                    value={filters.role_id}
                    onChange={handleRoleChange}
                >
                    <option value="">Tous les rôles</option>
                    {Object.entries(ROLE_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className={styles['users__table-container']}>
                {loading ? (
                    <div className={styles.users__loading}>
                        Chargement des utilisateurs...
                    </div>
                ) : users.length === 0 ? (
                    <div className={styles.users__empty}>
                        <div className={styles['users__empty-icon']}>
                            <UsersIcon size={32} />
                        </div>
                        <p>Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className={styles['users__table-wrapper']}>
                        <table className={styles.users__table}>
                            <thead>
                                <tr>
                                    <th>Utilisateur</th>
                                    <th>Rôle</th>
                                    <th>Agence</th>
                                    <th>Statut</th>
                                    <th>Dernière connexion</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles['users__name-cell']}>
                                                <div className={styles.users__avatar}>
                                                    {getInitials(user.prenom, user.nom)}
                                                </div>
                                                <div className={styles['users__name-info']} style={{ overflow: 'hidden' }}>
                                                    <span className={`${styles.users__name} truncate`} title={`${user.prenom} ${user.nom}`}>
                                                        {user.prenom} {user.nom}
                                                    </span>
                                                    <span className={`${styles.users__email} truncate`} title={user.email}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles['users__role-badge']} ${getRoleBadgeClass(user.role_id)}`}>
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
                                            <Badge variant={getStatusVariant(user.statut)} dot>
                                                {USER_STATUS_LABELS[user.statut]}
                                            </Badge>
                                        </td>
                                        <td>
                                            {user.derniere_connexion ? (
                                                <span className={styles.users__agency}>
                                                    <Clock size={14} />
                                                    {formatDate(user.derniere_connexion)}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)' }}>Jamais</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.users__actions}>
                                                <button
                                                    className={`${styles['users__action-btn']} ${styles['users__action-btn--view']}`}
                                                    onClick={() => navigate(`/users/${user.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className={`${styles['users__action-btn']} ${styles['users__action-btn--edit']}`}
                                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <div className={styles['users__dropdown-wrapper']} ref={openMenuId === user.id ? menuRef : null}>
                                                    <button
                                                        className={`${styles['users__action-btn']} ${styles['users__action-btn--more']} ${openMenuId === user.id ? styles['users__action-btn--active'] : ''}`}
                                                        onClick={() => toggleMenu(user.id)}
                                                        title="Plus d'options"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {openMenuId === user.id && (
                                                        <div className={styles['users__dropdown']}>
                                                            <button
                                                                className={styles['users__dropdown-item']}
                                                                onClick={() => handleStatusToggle(user)}
                                                            >
                                                                {user.statut === 'actif' ? (
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
                                                                className={`${styles['users__dropdown-item']} ${styles['users__dropdown-item--danger']}`}
                                                                onClick={() => handleDelete(user)}
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

export default UsersList;
