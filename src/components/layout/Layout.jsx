import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

function Layout() {
    const { isAuthenticated, loading } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pendingActions, setPendingActions] = useState(0);

    // Fermer le menu mobile lors du changement de taille d'écran
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Afficher un loader pendant la vérification de l'authentification
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-secondary)'
            }}>
                <div className="animate-spin" style={{
                    width: 40,
                    height: 40,
                    border: '3px solid var(--border-light)',
                    borderTopColor: 'var(--primary-500)',
                    borderRadius: '50%'
                }} />
            </div>
        );
    }

    // Rediriger vers la page de connexion si non authentifié
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    return (
        <div className={`${styles.layout} ${sidebarCollapsed ? styles['layout--collapsed'] : ''}`}>
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                pendingActions={pendingActions}
                mobileOpen={mobileMenuOpen}
            />

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className={`${styles.layout__overlay} ${styles['layout__overlay--visible']}`}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={styles.layout__content}>
                <Header
                    onMenuClick={handleSidebarToggle}
                    notifications={pendingActions}
                />

                <main className={styles.layout__main}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
