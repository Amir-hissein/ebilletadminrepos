import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Bus,
    Ticket,
    CreditCard,
    MessageSquare,
    Settings,
    ShieldCheck,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ROLES, ROLE_NAMES } from '../../../utils/constants';
import { getInitials } from '../../../utils/formatters';
import styles from './Sidebar.module.css';

// Configuration des liens de navigation par rôle
const getNavLinks = (roleId) => {
    const allLinks = {
        dashboard: {
            to: '/',
            icon: LayoutDashboard,
            label: 'Tableau de bord',
            roles: 'all'
        },
        agencies: {
            to: '/agencies',
            icon: Building2,
            label: 'Agences',
            roles: [ROLES.SUPER_ADMIN, ROLES.SOUS_ADMIN_AGENCES]
        },
        users: {
            to: '/users',
            icon: Users,
            label: 'Utilisateurs',
            roles: [ROLES.SUPER_ADMIN, ROLES.SOUS_ADMIN_AGENCES, ROLES.ADMIN_AGENCE]
        },
        trips: {
            to: '/trips',
            icon: Bus,
            label: 'Voyages',
            roles: [ROLES.SUPER_ADMIN, ROLES.SOUS_ADMIN_OPERATIONS, ROLES.ADMIN_AGENCE, ROLES.AGENT_AGENCE]
        },
        reservations: {
            to: '/reservations',
            icon: Ticket,
            label: 'Réservations',
            roles: 'all'
        },
        finance: {
            to: '/finance',
            icon: CreditCard,
            label: 'Finance',
            roles: [ROLES.SUPER_ADMIN, ROLES.SOUS_ADMIN_FINANCE]
        },
        support: {
            to: '/support',
            icon: MessageSquare,
            label: 'Support',
            roles: [ROLES.SUPER_ADMIN, ROLES.SOUS_ADMIN_SUPPORT]
        },
        criticalActions: {
            to: '/critical-actions',
            icon: ShieldCheck,
            label: 'Validations',
            roles: [ROLES.SUPER_ADMIN],
            badge: true // Afficher le nombre d'actions en attente
        },
        subAdmins: {
            to: '/sub-admins',
            icon: Shield,
            label: 'Sous-Admins',
            roles: [ROLES.SUPER_ADMIN]
        },
        settings: {
            to: '/settings',
            icon: Settings,
            label: 'Paramètres',
            roles: [ROLES.SUPER_ADMIN]
        }
    };

    return Object.values(allLinks).filter(link => {
        if (link.roles === 'all') return true;
        return link.roles.includes(roleId);
    });
};

function Sidebar({ collapsed, onToggle, pendingActions = 0, mobileOpen }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = getNavLinks(user?.role_id);
    const userInitials = getInitials(user?.prenom, user?.nom);
    const roleName = ROLE_NAMES[user?.role_id] || 'Utilisateur';

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles['sidebar--collapsed'] : ''} ${mobileOpen ? styles['sidebar--open'] : ''}`}>
            {/* Logo */}
            <div className={styles.sidebar__logo}>
                <span className={styles['sidebar__logo-title']}>ebillet</span>
                <span className={styles['sidebar__logo-subtitle']}>Administration</span>
            </div>

            {/* Navigation */}
            <nav className={styles.sidebar__nav}>
                <div className={styles.sidebar__section}>
                    <span className={styles['sidebar__section-title']}>Menu principal</span>

                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            data-tooltip={link.label}
                            className={({ isActive }) =>
                                `${styles.sidebar__link} ${isActive ? styles['sidebar__link--active'] : ''}`
                            }
                        >
                            <link.icon className={styles['sidebar__link-icon']} size={20} />
                            <span className={styles['sidebar__link-text']}>{link.label}</span>
                            {link.badge && pendingActions > 0 && (
                                <span className={styles['sidebar__link-badge']}>{pendingActions}</span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Section */}
            <div className={styles.sidebar__user}>
                <div className={styles['sidebar__user-info']}>
                    <div className={styles['sidebar__user-avatar']}>
                        {userInitials}
                    </div>
                    <div className={styles['sidebar__user-details']}>
                        <div className={styles['sidebar__user-name']}>
                            {user?.prenom} {user?.nom}
                        </div>
                        <div className={styles['sidebar__user-role']}>{roleName}</div>
                    </div>
                </div>

                <button
                    className={styles.sidebar__link}
                    onClick={handleLogout}
                    style={{ marginTop: '0.5rem' }}
                >
                    <LogOut size={20} />
                    <span className={styles['sidebar__link-text']}>Déconnexion</span>
                </button>
            </div>

            {/* Toggle Button */}
            <button
                className={styles.sidebar__toggle}
                onClick={onToggle}
                aria-label={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    );
}

export default Sidebar;
