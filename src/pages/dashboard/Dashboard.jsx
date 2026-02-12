import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
    Calendar, TrendingUp, TrendingDown,
    Users, CreditCard, Bus, Ticket, Download,
    Building2, Activity, ArrowUpRight, ArrowDownRight,
    MapPin, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import styles from './Dashboard.module.css';

// --- DATA ---
const platformTrends = [
    { name: '01/02', rev: 4000, bookings: 240, users: 120 },
    { name: '02/02', rev: 3000, bookings: 139, users: 98 },
    { name: '03/02', rev: 2000, bookings: 980, users: 84 },
    { name: '04/02', rev: 2780, bookings: 390, users: 110 },
    { name: '05/02', rev: 1890, bookings: 480, users: 130 },
    { name: '06/02', rev: 2390, bookings: 380, users: 140 },
    { name: '07/02', rev: 3490, bookings: 430, users: 155 },
];

const sparkRes = [
    { v: 10 }, { v: 25 }, { v: 15 }, { v: 45 }, { v: 30 }, { v: 55 }, { v: 40 }
];
const sparkVoy = [
    { v: 30 }, { v: 40 }, { v: 35 }, { v: 50 }, { v: 49 }, { v: 60 }, { v: 56 }
];
const sparkRev = [
    { v: 4000 }, { v: 3000 }, { v: 2000 }, { v: 2780 }, { v: 1890 }, { v: 2390 }, { v: 3490 }
];
const sparkPart = [
    { v: 80 }, { v: 82 }, { v: 81 }, { v: 85 }, { v: 87 }, { v: 88 }, { v: 89 }
];

const routeData = [
    { name: 'N\'Djamena - Sarh', val: 45 },
    { name: 'N\'Djamena - Moundou', val: 38 },
    { name: 'Abéché - N\'Djamena', val: 32 },
    { name: 'Sarh - Moundou', val: 24 },
];

const statusData = [
    { name: 'Confirmed', value: 70, color: '#10b981' },
    { name: 'Pending', value: 20, color: '#f59e0b' },
    { name: 'Cancelled', value: 10, color: '#ef4444' },
];

const activityLogs = [
    { id: 1, user: 'Mahamat Idriss', action: 'Réservation VIP', amount: '15,000 CFA', time: 'Il y a 2 min', type: 'success' },
    { id: 2, user: 'System', action: 'Voyage #456 complété', amount: null, time: 'Il y a 15 min', type: 'info' },
    { id: 3, user: 'Agence Sahel', action: 'Nouveau trajet ajouté', amount: null, time: 'Il y a 45 min', type: 'warning' },
];

// --- COMPONENTS ---

const Sparkline = ({ data, color }) => (
    <div style={{ width: '100px', height: '40px' }}>
        <ResponsiveContainer>
            <AreaChart data={data}>
                <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const KPICard = ({ title, value, trend, trendValue, icon: Icon, sparkData, color, onClick }) => (
    <div className={styles.kpi_card} onClick={onClick}>
        <div className={styles.kpi_header}>
            <div className={`${styles.kpi_icon} ${styles[`icon_${color}`]}`}>
                <Icon size={20} />
            </div>
            <Sparkline data={sparkData} color={`var(--${color}-500)`} />
        </div>
        <div className={styles.kpi_body}>
            <div className={styles.kpi_title}>{title}</div>
            <div className={styles.kpi_value_row}>
                <div className={styles.kpi_value}>{value}</div>
                <div className={`${styles.kpi_trend} ${styles[trend]}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            </div>
        </div>
    </div>
);

// --- DATA MAPPING ---
const DATA_MODES = {
    Overview: {
        primaryMetric: 'rev',
        secondaryMetric: 'bookings',
        title: 'Performance de la Plateforme',
        subtitle: 'Analyse des revenus et volumes de réservations',
        legend: [
            { label: 'Revenu', key: 'rev', type: 'solid', color: 'var(--primary-500)' },
            { label: 'Volume Réservations', key: 'bookings', type: 'dashed', color: '#9333ea' }
        ]
    },
    Finance: {
        primaryMetric: 'rev',
        secondaryMetric: 'users',
        title: 'Analyse Financière',
        subtitle: 'Revenu vs Recrutement Utilisateurs',
        legend: [
            { label: 'Revenu (CFA)', key: 'rev', type: 'solid', color: 'var(--success-500)' },
            { label: 'Nouveaux Users', key: 'users', type: 'solid', color: 'var(--primary-400)' }
        ]
    },
    Logistics: {
        primaryMetric: 'bookings',
        secondaryMetric: 'users',
        title: 'Flux Logistique',
        subtitle: 'Réservations vs Trafic Utilisateur',
        legend: [
            { label: 'Réservations', key: 'bookings', type: 'solid', color: '#9333ea' },
            { label: 'Utilisateurs Actifs', key: 'users', type: 'dashed', color: 'var(--warning-500)' }
        ]
    }
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('Overview');
    const [timeRange, setTimeRange] = useState('7 derniers jours');

    const currentMode = DATA_MODES[activeView];

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Mois,Revenu,Reservations,Users\n"
            + platformTrends.map(e => `${e.name},${e.rev},${e.bookings},${e.users}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rapport_${activeView.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.enterprise_container}>
            {/* Top Navigation / Context */}
            <header className={styles.dashboard_top_nav}>
                <div className={styles.brand_context}>
                    <div className={styles.system_status}>
                        <div className={styles.status_dot}></div>
                        <span>Live Operational</span>
                    </div>
                    <div className={styles.greeting_row}>
                        <h1>Tableau de Bord Stratégique</h1>
                        <span className={styles.date_display}>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
                <div className={styles.global_actions}>
                    <div className={styles.tab_group}>
                        {['Overview', 'Finance', 'Logistics'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab_btn} ${activeView === tab ? styles.tab_btn_active : ''}`}
                                onClick={() => setActiveView(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className={styles.btn_primary_outline} onClick={handleExport}>
                        <Download size={16} />
                        <span>Rapport Complet</span>
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className={styles.kpi_grid}>
                <KPICard
                    title="Réservations" value="1,240"
                    trend="up" trendValue="+12.5%"
                    icon={Ticket} color="primary"
                    sparkData={sparkRes}
                    onClick={() => navigate('/reservations')}
                />
                <KPICard
                    title="Voyages Actifs" value="56"
                    trend="up" trendValue="+4.2%"
                    icon={Bus} color="purple"
                    sparkData={sparkVoy}
                    onClick={() => navigate('/voyages')}
                />
                <KPICard
                    title="Chiffre d'Affaires" value="12.5M CFA"
                    trend="up" trendValue="+18.7%"
                    icon={CreditCard} color="success"
                    sparkData={sparkRev}
                    onClick={() => navigate('/finance')}
                />
                <KPICard
                    title="Partenaires" value="89"
                    trend="up" trendValue="+2.1%"
                    icon={Building2} color="warning"
                    sparkData={sparkPart}
                    onClick={() => navigate('/agencies')}
                />
            </div>

            {/* Main Content Grid */}
            <div className={styles.main_analytics_grid}>
                {/* Large Analytics Card */}
                <div className={styles.analytics_card_main}>
                    <div className={styles.card_header_pro}>
                        <div className={styles.header_group}>
                            <h3>{currentMode.title}</h3>
                            <p>{currentMode.subtitle}</p>
                        </div>
                        <select
                            className={styles.select_compact}
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7 derniers jours">7 derniers jours</option>
                            <option value="30 derniers jours">30 derniers jours</option>
                            <option value="Cette année">Cette année</option>
                        </select>
                    </div>
                    <div className={styles.main_chart_wrapper}>
                        <ResponsiveContainer width="100%" height={380}>
                            <AreaChart data={platformTrends} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={currentMode.legend[0].color} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={currentMode.legend[0].color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" opacity={0.6} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                                    tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: 'var(--shadow-xl)',
                                        background: 'var(--bg-primary)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={currentMode.primaryMetric}
                                    stroke={currentMode.legend[0].color}
                                    strokeWidth={3}
                                    fill="url(#primaryGrad)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: currentMode.legend[0].color }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={currentMode.secondaryMetric}
                                    stroke={currentMode.legend[1].color}
                                    strokeWidth={3}
                                    fill="none"
                                    strokeDasharray={currentMode.legend[1].type === 'dashed' ? "5 5" : "0"}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chart_footer}>
                        <div className={styles.legend_pro}>
                            {currentMode.legend.map(l => (
                                <div key={l.key} className={styles.legend_tag}>
                                    <span
                                        className={l.type === 'solid' ? styles.dot_solid : styles.dot_dashed}
                                        style={{ background: l.type === 'solid' ? l.color : 'transparent', borderColor: l.color }}
                                    ></span>
                                    {l.label}
                                </div>
                            ))}
                        </div>
                        <button className={styles.btn_text} onClick={() => navigate(activeView === 'Finance' ? '/finance' : '/reservations')}>
                            Détails analytiques <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Secondary Widgets Column */}
                <div className={styles.side_widgets}>
                    <div className={styles.widget_pro}>
                        <div className={styles.widget_header}>
                            <h3>Répartition Flux</h3>
                        </div>
                        <div className={styles.donut_wrapper}>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%" cy="50%"
                                        innerRadius={45} outerRadius={65}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className={styles.donut_stats}>
                                {statusData.map(s => (
                                    <div key={s.name} className={styles.donut_item}>
                                        <span style={{ color: s.color }}>{s.value}%</span>
                                        <label>{s.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.widget_pro}>
                        <div className={styles.widget_header}>
                            <h3>Trajets Populaires</h3>
                        </div>
                        <div className={styles.bar_list}>
                            {routeData.map(route => (
                                <div key={route.name} className={styles.route_item} onClick={() => navigate('/voyages')} style={{ cursor: 'pointer' }}>
                                    <div className={styles.route_info}>
                                        <span>{route.name}</span>
                                        <label>{route.val} voy.</label>
                                    </div>
                                    <div className={styles.progress_bar}>
                                        <div className={styles.progress_fill} style={{ width: `${route.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Activity & Quick Actions */}
            <div className={styles.bottom_grid_pro}>
                <div className={styles.activity_panel}>
                    <div className={styles.panel_header}>
                        <div className={styles.header_group}>
                            <h3>Journal d'activité en direct</h3>
                            <p>Derniers événements système et utilisateurs</p>
                        </div>
                        <Activity size={18} className="text-primary-500" />
                    </div>
                    <div className={styles.logs_container}>
                        {activityLogs.map(log => (
                            <div key={log.id} className={styles.log_entry}>
                                <div className={`${styles.log_dot} ${styles[`dot_${log.type}`]}`}></div>
                                <div className={styles.log_main}>
                                    <div className={styles.log_text}>
                                        <strong>{log.user}</strong> — {log.action}
                                        {log.amount && <span className={styles.log_amount}> ({log.amount})</span>}
                                    </div>
                                    <div className={styles.log_time}>{log.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.quick_action_panel}>
                    <h3>Accès Rapides</h3>
                    <div className={styles.action_grid}>
                        {[
                            { label: 'Nouvelle Agence', icon: Building2, color: 'primary', path: '/agencies/new' },
                            { label: 'Gestion Users', icon: Users, color: 'purple', path: '/users' },
                            { label: 'Rapport Finance', icon: ShieldCheck, color: 'success', path: '/finance' },
                            { label: 'Logs Système', icon: Activity, color: 'warning', path: '/support' }
                        ].map((act, i) => (
                            <div key={i} className={styles.action_card_mini} onClick={() => navigate(act.path)}>
                                <div className={`${styles.mini_icon} ${styles[`icon_${act.color}`]}`}>
                                    <act.icon size={18} />
                                </div>
                                <span>{act.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.support_card_mini}>
                        <div className={styles.support_info}>
                            <h4>Besoin d'aide ?</h4>
                            <p>Contactez le support technique 24/7</p>
                        </div>
                        <button className={styles.btn_white_sm} onClick={() => navigate('/support')}>Aide</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
