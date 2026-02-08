import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ROLE_NAMES } from '../../../utils/constants';
import { getInitials } from '../../../utils/formatters';
import styles from './Header.module.css';

// Mapping des routes vers les titres
const routeTitles = {
    '/': 'Tableau de bord',
    '/agencies': 'Agences',
    '/users': 'Utilisateurs',
    '/trips': 'Voyages',
    '/reservations': 'Réservations',
    '/finance': 'Finance',
    '/support': 'Support',
    '/critical-actions': 'Validations',
    '/settings': 'Paramètres'
};

function Header({ onMenuClick, notifications = 0 }) {
    const { user } = useAuth();
    const location = useLocation();

    // Générer les breadcrumbs
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Accueil', path: '/' }];

        let currentPath = '';
        paths.forEach((path) => {
            currentPath += `/${path}`;
            const title = routeTitles[currentPath] || path;
            breadcrumbs.push({ label: title, path: currentPath });
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();
    const currentTitle = routeTitles[location.pathname] || 'Tableau de bord';
    const userInitials = getInitials(user?.prenom, user?.nom);
    const roleName = ROLE_NAMES[user?.role_id] || 'Utilisateur';

    return (
        <header className={styles.header}>
            {/* Left Section */}
            <div className={styles.header__left}>
                <button
                    className={styles['header__menu-btn']}
                    onClick={onMenuClick}
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>

                {/* Breadcrumbs */}
                <nav className={styles.header__breadcrumbs} aria-label="Fil d'Ariane">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.path} className={styles.header__breadcrumb}>
                            {index > 0 && (
                                <ChevronRight
                                    size={14}
                                    className={styles['header__breadcrumb-separator']}
                                />
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className={styles['header__breadcrumb-current']}>
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className={styles['header__breadcrumb-link']}
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>
            </div>

            {/* Right Section */}
            <div className={styles.header__right}>
                {/* Search */}
                <div className={styles.header__search}>
                    <Search
                        size={18}
                        className={styles['header__search-icon']}
                    />
                    <input
                        type="text"
                        className={styles['header__search-input']}
                        placeholder="Rechercher..."
                        aria-label="Rechercher"
                    />
                </div>

                {/* Notifications */}
                <div className={styles.header__notifications}>
                    <button
                        className={styles['header__icon-btn']}
                        aria-label={`${notifications} notifications`}
                    >
                        <Bell size={20} />
                        {notifications > 0 && (
                            <span className={styles['header__notification-badge']}>
                                {notifications > 9 ? '9+' : notifications}
                            </span>
                        )}
                    </button>
                </div>

                {/* User */}
                <div className={styles.header__user}>
                    <div className={styles['header__user-avatar']}>
                        {userInitials}
                    </div>
                    <div className={styles['header__user-info']}>
                        <span className={styles['header__user-name']}>
                            {user?.prenom} {user?.nom}
                        </span>
                        <span className={styles['header__user-role']}>{roleName}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
