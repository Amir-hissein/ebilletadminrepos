import {
    Building2,
    Bus,
    Ticket,
    TrendingUp,
    TrendingDown,
    Users,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../../components/common/Badge';
import { ROLES, ROLE_NAMES } from '../../utils/constants';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import styles from './Dashboard.module.css';

// Données fictives pour démo (à remplacer par API)
const mockStats = {
    agencies: { value: 24, trend: 12, up: true },
    trips: { value: 156, trend: 8, up: true },
    reservations: { value: 1247, trend: -3, up: false },
    revenue: { value: 24850000, trend: 15, up: true }
};

const mockRecentActivity = [
    {
        id: 1,
        type: 'reservation',
        title: 'Nouvelle réservation',
        description: 'RES2026001234 - N\'Djamena → Abéché',
        time: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
        id: 2,
        type: 'agency',
        title: 'Agence validée',
        description: 'Transport Express a été activée',
        time: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
        id: 3,
        type: 'trip',
        title: 'Voyage créé',
        description: 'Bus 08h00 Moundou → Sarh',
        time: new Date(Date.now() - 1000 * 60 * 120)
    },
    {
        id: 4,
        type: 'alert',
        title: 'Action en attente',
        description: 'Demande de modification de commission',
        time: new Date(Date.now() - 1000 * 60 * 180)
    }
];

const mockPendingActions = [
    { id: 1, type: 'Modifier commission', agency: 'Voyage Sahel', status: 'en_attente' },
    { id: 2, type: 'Suspendre agence', agency: 'Trans Tchad', status: 'en_attente' },
    { id: 3, type: 'Remboursement', agency: 'Express Bus', status: 'en_attente' }
];

function StatCard({ icon: Icon, label, value, trend, up, color = 'primary' }) {
    return (
        <div className={`${styles['stat-card']} ${styles[`stat-card--${color}`]}`}>
            <div className={`${styles['stat-card__icon']} ${styles[`stat-card__icon--${color}`]}`}>
                <Icon size={26} />
            </div>
            <div className={styles['stat-card__content']}>
                <div className={styles['stat-card__label']}>{label}</div>
                <div className={styles['stat-card__value']}>{value}</div>
                {trend !== undefined && (
                    <div className={`${styles['stat-card__trend']} ${up ? styles['stat-card__trend--up'] : styles['stat-card__trend--down']}`}>
                        {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend)}% ce mois
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityItem({ type, title, description, time }) {
    const icons = {
        reservation: Ticket,
        agency: Building2,
        trip: Bus,
        alert: AlertCircle
    };
    const Icon = icons[type] || Ticket;

    return (
        <div className={styles['activity-item']}>
            <div className={`${styles['activity-item__icon']} ${styles[`activity-item__icon--${type}`]}`}>
                <Icon size={18} />
            </div>
            <div className={styles['activity-item__content']}>
                <div className={styles['activity-item__title']}>{title}</div>
                <div className={styles['activity-item__description']}>{description}</div>
            </div>
            <div className={styles['activity-item__time']}>
                {formatRelativeTime(time)}
            </div>
        </div>
    );
}

function Dashboard() {
    const { user, isSuperAdmin, isSousAdmin, isAgencyUser } = useAuth();
    const roleName = ROLE_NAMES[user?.role_id] || 'Utilisateur';

    return (
        <div className={styles.dashboard}>
            {/* Header with Gradient */}
            <div className={styles.dashboard__header}>
                <div className={styles['dashboard__header-content']}>
                    <h1 className={styles.dashboard__greeting}>
                        Bienvenue, {user?.prenom} 👋
                    </h1>
                    <p className={styles.dashboard__role}>
                        {roleName} • Voici un aperçu de votre activité
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.dashboard__stats}>
                {(isSuperAdmin || user?.role_id === ROLES.SOUS_ADMIN_AGENCES) && (
                    <StatCard
                        icon={Building2}
                        label="Agences actives"
                        value={mockStats.agencies.value}
                        trend={mockStats.agencies.trend}
                        up={mockStats.agencies.up}
                        color="primary"
                    />
                )}

                <StatCard
                    icon={Bus}
                    label="Voyages ce mois"
                    value={mockStats.trips.value}
                    trend={mockStats.trips.trend}
                    up={mockStats.trips.up}
                    color="success"
                />

                <StatCard
                    icon={Ticket}
                    label="Réservations"
                    value={mockStats.reservations.value.toLocaleString('fr-FR')}
                    trend={mockStats.reservations.trend}
                    up={mockStats.reservations.up}
                    color="warning"
                />

                {(isSuperAdmin || user?.role_id === ROLES.SOUS_ADMIN_FINANCE) && (
                    <StatCard
                        icon={CreditCard}
                        label="Revenus"
                        value={formatCurrency(mockStats.revenue.value)}
                        trend={mockStats.revenue.trend}
                        up={mockStats.revenue.up}
                        color="danger"
                    />
                )}
            </div>

            {/* Main Content Grid */}
            <div className={styles.dashboard__grid}>
                {/* Recent Activity */}
                <div className={styles['section-card']}>
                    <div className={styles['section-card__header']}>
                        <div className={styles['section-card__title']}>
                            <div className={styles['section-card__title-icon']}>
                                <Activity size={18} />
                            </div>
                            Activité récente
                        </div>
                    </div>
                    <div className={styles['section-card__body']}>
                        <div className={styles['activity-list']}>
                            {mockRecentActivity.map(activity => (
                                <ActivityItem key={activity.id} {...activity} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Actions (Super Admin only) */}
                {isSuperAdmin && (
                    <div className={styles['section-card']}>
                        <div className={styles['section-card__header']}>
                            <div className={styles['section-card__title']}>
                                <div className={styles['section-card__title-icon']} style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}>
                                    <Clock size={18} />
                                </div>
                                Actions en attente
                            </div>
                            <Badge variant="danger">{mockPendingActions.length}</Badge>
                        </div>
                        <div className={styles['section-card__body']}>
                            <div className={styles['activity-list']}>
                                {mockPendingActions.map(action => (
                                    <div key={action.id} className={styles['pending-item']}>
                                        <div className={styles['pending-item__icon']}>
                                            <Clock size={18} />
                                        </div>
                                        <div className={styles['pending-item__content']}>
                                            <div className={styles['pending-item__title']}>{action.type}</div>
                                            <div className={styles['pending-item__agency']}>{action.agency}</div>
                                        </div>
                                        <Badge variant="warning">En attente</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
