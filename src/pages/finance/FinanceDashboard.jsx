import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    DollarSign, TrendingUp, CreditCard, Activity, Download,
    ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFinanceStats, getTransactions } from '../../api/finance.api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import styles from './Finance.module.css';

const Sparkline = ({ data, color }) => (
    <div style={{ width: '100px', height: '40px' }}>
        <ResponsiveContainer>
            <AreaChart data={data}>
                <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const StatCard = ({ label, value, trend, trendValue, icon: Icon, sparkData, color, onClick }) => (
    <div className={styles.kpi_card} onClick={onClick}>
        <div className={styles.kpi_header_pro}>
            <div className={`${styles.kpi_icon_pro} ${styles[`icon_${color}`]}`}>
                <Icon size={20} />
            </div>
            <Sparkline data={sparkData} color={`var(--${color === 'blue' ? 'primary' : color}-500)`} />
        </div>
        <div className={styles.kpi_body_pro}>
            <div className={styles.kpi_label_pro}>{label}</div>
            <div className={styles.kpi_value_row_pro}>
                <div className={styles.kpi_value_pro}>{value}</div>
                <div className={`${styles.kpi_trend_pro} ${styles.trend_up}`}>
                    <ArrowUpRight size={14} />
                    {trendValue}
                </div>
            </div>
        </div>
    </div>
);

const FinanceDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [financeData, transactionsData] = await Promise.all([
                getFinanceStats(),
                getTransactions({ limit: 10 })
            ]);
            setStats(financeData);
            setRecentTransactions(transactionsData.data || []);
        } catch (error) {
            console.error('Erreur chargement données finance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        alert('Export PDF - Fonctionnalité à implémenter');
    };

    const formatYAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    if (loading) return <div>Chargement...</div>;
    if (!stats) return <div>Erreur de chargement</div>;

    // Mock data for trends (à remplacer par de vraies données API)
    const mockTrends = {
        revenus: { change: 12.5, direction: 'up' },
        commissions: { change: 8.3, direction: 'up' },
        transactions: { change: 15.0, direction: 'up' },
        panier_moyen: { change: 3.2, direction: 'up' }
    };

    // Mock data for top agencies with static values
    const mockTopAgencies = [
        { name: 'Transport Express Tchad', revenue: 15750000 },
        { name: 'Voyage Sahel', revenue: 11250000 },
        { name: 'Bus Rapide N\'Djamena', revenue: 9000000 },
        { name: 'Air Tchad Connect', revenue: 6750000 },
        { name: 'Autres', revenue: 2250000 }
    ];

    const sparkRev = [{ v: 40 }, { v: 55 }, { v: 45 }, { v: 70 }, { v: 65 }, { v: 85 }, { v: 80 }];
    const sparkComm = [{ v: 20 }, { v: 30 }, { v: 25 }, { v: 40 }, { v: 35 }, { v: 50 }, { v: 48 }];
    const sparkVol = [{ v: 100 }, { v: 120 }, { v: 110 }, { v: 140 }, { v: 135 }, { v: 160 }, { v: 155 }];
    const sparkAvg = [{ v: 12 }, { v: 13 }, { v: 12.5 }, { v: 14 }, { v: 13.8 }, { v: 15 }, { v: 14.5 }];

    return (
        <div className={styles.enterprise_container}>
            <header className={styles.finance_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Analyse Financière</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système Actif</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <select
                        className={styles.select_compact}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="7">7 derniers jours</option>
                        <option value="30">30 derniers jours</option>
                        <option value="90">3 derniers mois</option>
                        <option value="365">Cette année</option>
                    </select>
                    <button className={styles.btn_primary_outline} onClick={handleExportPDF}>
                        <Download size={16} />
                        <span>Exporter Rapport</span>
                    </button>
                </div>
            </header>

            <div className={styles.kpi_grid_pro}>
                <StatCard
                    label="Revenus Totaux"
                    value={formatCurrency(stats.total_revenus)}
                    trendValue="+12.5%"
                    icon={DollarSign}
                    color="success"
                    sparkData={sparkRev}
                />
                <StatCard
                    label="Commissions Plateforme"
                    value={formatCurrency(stats.total_commissions)}
                    trendValue="+8.3%"
                    icon={TrendingUp}
                    color="blue"
                    sparkData={sparkComm}
                />
                <StatCard
                    label="Volume Transactions"
                    value={stats.nombre_transactions}
                    trendValue="+15.0%"
                    icon={Activity}
                    color="warning"
                    sparkData={sparkVol}
                />
                <StatCard
                    label="Panier Moyen"
                    value={formatCurrency(stats.total_revenus / (stats.nombre_transactions || 1))}
                    trendValue="+3.2%"
                    icon={CreditCard}
                    color="purple"
                    sparkData={sparkAvg}
                />
            </div>

            <div className={styles.main_analytics_grid_pro}>
                <div className={styles.analytics_card_pro}>
                    <div className={styles.card_header_pro}>
                        <div className={styles.header_group_pro}>
                            <h3>Flux de Trésorerie</h3>
                            <p>Analyse des revenus et commissions nettes</p>
                        </div>
                    </div>
                    <div className={styles.main_chart_wrapper_pro}>
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={stats.revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" opacity={0.6} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={formatYAxis} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-xl)', background: 'var(--bg-primary)', fontSize: '12px' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="revenus" stroke="var(--success-500)" strokeWidth={3} fill="url(#colorRevenus)" name="Revenus Totaux" />
                                <Area type="monotone" dataKey="commissions" stroke="var(--primary-500)" strokeWidth={3} fill="none" strokeDasharray="5 5" name="Commissions" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.analytics_card_pro}>
                    <div className={styles.card_header_pro}>
                        <div className={styles.header_group_pro}>
                            <h3>Top Agences</h3>
                            <p>Classement par chiffre d'affaires</p>
                        </div>
                    </div>
                    <div className={styles.main_chart_wrapper_pro}>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={mockTopAgencies} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" opacity={0.6} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={formatYAxis} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-xl)', background: 'var(--bg-primary)', fontSize: '12px' }} formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="revenue" fill="var(--primary-500)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className={styles.transactions_panel_pro}>
                <div className={styles.panel_header_pro}>
                    <div className={styles.header_group_pro}>
                        <h3>Transactions Récentes</h3>
                        <p>Derniers flux financiers enregistrés</p>
                    </div>
                    <Link to="/finance/transactions" className={styles.btn_text_pro}>
                        Voir tout <ChevronRight size={16} />
                    </Link>
                </div>
                <div className={styles.table_scroll_pro}>
                    <table className={styles.table_pro}>
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Type</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        Aucune transaction récente
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.slice(0, 8).map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.reference_paiement}</td>
                                        <td>{formatDate(t.created_at)}</td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(t.montant)}</td>
                                        <td>
                                            <Badge variant={t.type_transaction === 'paiement' ? 'info' : 'warning'}>
                                                {t.type_transaction === 'paiement' ? 'Paiement' : 'Commission'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge variant={t.statut === 'completee' ? 'success' : 'warning'}>
                                                {t.statut === 'completee' ? 'Complétée' : 'En attente'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
