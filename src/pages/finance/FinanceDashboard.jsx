import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { getFinanceStats } from '../../api/finance.api';
import { formatCurrency } from '../../utils/formatters';
import styles from './Finance.module.css';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={styles.statCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <span className={styles.statLabel}>{label}</span>
                <div className={styles.statValue}>{value}</div>
            </div>
            <div style={{
                padding: '0.75rem',
                borderRadius: '50%',
                backgroundColor: `${color}20`,
                color: color
            }}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const FinanceDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getFinanceStats();
            setStats(data);
        } catch (error) {
            console.error('Erreur chargement stats finance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (!stats) return <div>Erreur de chargement</div>;

    return (
        <div className="fade-in">
            <div className={styles.transactionsHeader}>
                <h1 className="page-title">Tableau de bord financier</h1>
                <div className="flex gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={() => window.location.href = '/finance/commissions'}
                    >
                        Gérer commissions
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/finance/transactions'}
                    >
                        Voir les transactions
                    </button>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                <StatCard
                    label="Revenus Totaux"
                    value={formatCurrency(stats.total_revenus)}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    label="Commissions Plateforme"
                    value={formatCurrency(stats.total_commissions)}
                    icon={TrendingUp}
                    color="#3b82f6"
                />
                <StatCard
                    label="Volume Transactions"
                    value={stats.nombre_transactions}
                    icon={Activity}
                    color="#f59e0b"
                />
                <StatCard
                    label="Panier Moyen"
                    value={formatCurrency(stats.total_revenus / (stats.nombre_transactions || 1))}
                    icon={CreditCard}
                    color="#6366f1"
                />
            </div>

            <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>Évolution des Revenus</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart
                        data={stats.revenue_chart}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenus"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorRevenus)"
                            name="Revenus Totaux"
                        />
                        <Area
                            type="monotone"
                            dataKey="commissions"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorCommissions)"
                            name="Commissions"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinanceDashboard;
