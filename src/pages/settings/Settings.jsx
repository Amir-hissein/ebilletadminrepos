import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Globe, CreditCard, Shield,
    Save, RotateCcw, Monitor, AlertTriangle,
    Mail, Phone, MapPin, Share2, Sun, Moon, DollarSign,
    FileText, Bell, Lock, Eye, History, Smartphone, Tablet, Laptop
} from 'lucide-react';
import { getSettings, updateSettings } from '../../api/settings.api';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Settings.module.css';

const Settings = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('platform');
    const [message, setMessage] = useState(null);

    // Copie locale pour modification
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings();
            setSettings(data);
            setLocalSettings(JSON.parse(JSON.stringify(data))); // Deep copy
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (category, field, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const categoryData = localSettings[activeTab];
            await updateSettings(activeTab, categoryData);

            setSettings(JSON.parse(JSON.stringify(localSettings)));
            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });

            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'error', text: 'Une erreur est survenue lors de la sauvegarde.' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(JSON.parse(JSON.stringify(settings)));
        setMessage({ type: 'info', text: 'Modifications annulées.' });
        setTimeout(() => setMessage(null), 2000);
    };

    if (loading || !localSettings) {
        return <div className="text-center p-12 text-gray-500">Chargement des paramètres...</div>;
    }

    const navItems = [
        { id: 'platform', label: 'Plateforme', icon: Globe },
        { id: 'finance', label: 'Finance & Commissions', icon: CreditCard },
        { id: 'security', label: 'Sécurité & Accès', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'system', label: 'État du Système', icon: Monitor },
        { id: 'appearance', label: 'Apparence', icon: Eye },
        { id: 'audit', label: 'Logs d\'Audit', icon: History },
    ];

    return (
        <div className={`fade-in ${styles.container}`}>
            {/* Premium Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Configuration Système</h1>
                    <p className={styles.subtitle}>Gérez les paramètres globaux de la plateforme E-Billet, la sécurité et l'état du système.</p>
                </div>
            </div>

            {message && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertWarning}`}>
                    <Shield size={18} />
                    <span>{message.text}</span>
                </div>
            )}

            <div className={styles.settingsLayout}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebarNav}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className={styles.mainContent}>

                    {/* ONGLET PLATEFORME */}
                    {activeTab === 'platform' && (
                        <>
                            <div className={styles.settingsCard}>
                                <div className={styles.cardHeader}>
                                    <Globe size={18} />
                                    <h3>Informations Générales</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nom de la plateforme</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={localSettings.platform.name}
                                            onChange={(e) => handleChange('platform', 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Slogan</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={localSettings.platform.tagline || ''}
                                            onChange={(e) => handleChange('platform', 'tagline', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.settingsCard}>
                                <div className={styles.cardHeader}>
                                    <Mail size={18} />
                                    <h3>Coordonnées de Contact</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email de support</label>
                                        <div className={styles.inputWrapper}>
                                            <Mail size={16} className={styles.inputIcon} />
                                            <input
                                                type="email"
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                                value={localSettings.platform.email_contact}
                                                onChange={(e) => handleChange('platform', 'email_contact', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Téléphone assistance</label>
                                        <div className={styles.inputWrapper}>
                                            <Phone size={16} className={styles.inputIcon} />
                                            <input
                                                type="text"
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                                value={localSettings.platform.phone_contact}
                                                onChange={(e) => handleChange('platform', 'phone_contact', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ONGLET FINANCE */}
                    {activeTab === 'finance' && (
                        <>
                            <div className={styles.settingsCard}>
                                <div className={styles.cardHeader}>
                                    <CreditCard size={18} />
                                    <h3>Configuration des Commissions</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Commission Standard Platforme (%)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={localSettings.finance.default_commission_rate}
                                            onChange={(e) => handleChange('finance', 'default_commission_rate', parseInt(e.target.value))}
                                        />
                                        <p className={styles.helpText}>Pourcentage prélevé par défaut.</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Devise</label>
                                        <select
                                            className={styles.select}
                                            value={localSettings.finance.currency}
                                            onChange={(e) => handleChange('finance', 'currency', e.target.value)}
                                        >
                                            <option value="FCFA">FCFA - Franc CFA</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="USD">USD - Dollar US</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ONGLET SÉCURITÉ */}
                    {activeTab === 'security' && (
                        <>
                            <div className={styles.settingsCard}>
                                <div className={styles.cardHeader}>
                                    <Lock size={18} />
                                    <h3>Sécurité Avancée</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.switchRow}>
                                        <div className={styles.switchInfo}>
                                            <span className={styles.switchTitle}>Double Authentification (2FA)</span>
                                            <span className={styles.switchDesc}>Exiger un code de sécurité à chaque connexion.</span>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={localSettings.security.two_factor_auth}
                                                onChange={(e) => handleChange('security', 'two_factor_auth', e.target.checked)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Expiration du Mot de Passe (Jours)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={localSettings.security.password_expiry_days}
                                            onChange={(e) => handleChange('security', 'password_expiry_days', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.settingsCard}>
                                <div className={styles.cardHeader}>
                                    <Smartphone size={18} />
                                    <h3>Sessions Actives</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.sessionList}>
                                        {localSettings.security.active_sessions.map(session => (
                                            <div key={session.id} className={styles.sessionItem}>
                                                <div className={styles.sessionMain}>
                                                    <div className={styles.sessionIcon}>
                                                        {session.device.includes('Chrome') ? <Laptop size={20} /> : <Smartphone size={20} />}
                                                    </div>
                                                    <div className={styles.sessionMeta}>
                                                        <span className={styles.deviceName}>{session.device}</span>
                                                        <span className={styles.deviceMeta}>{session.location} • {session.last_active}</span>
                                                    </div>
                                                </div>
                                                {session.status === 'active' ? (
                                                    <span className="text-xs font-bold text-emerald-500 uppercase">En cours</span>
                                                ) : (
                                                    <button className="text-xs font-bold text-red-500 hover:underline">Déconnecter</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ONGLET NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className={styles.settingsCard}>
                            <div className={styles.cardHeader}>
                                <Bell size={18} />
                                <h3>Préférences de Notification</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <table className={styles.prefTable}>
                                    <thead>
                                        <tr>
                                            <th>Événement</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className={styles.prefLabel}>Nouvelle Réservation (Email)</td>
                                            <td>
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={localSettings.notifications.email_new_reservation}
                                                        onChange={(e) => handleChange('notifications', 'email_new_reservation', e.target.checked)}
                                                    />
                                                    <span className={styles.slider}></span>
                                                </label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={styles.prefLabel}>Alertes Critiques (SMS)</td>
                                            <td>
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={localSettings.notifications.sms_critical_alerts}
                                                        onChange={(e) => handleChange('notifications', 'sms_critical_alerts', e.target.checked)}
                                                    />
                                                    <span className={styles.slider}></span>
                                                </label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={styles.prefLabel}>Rapport Hebdomadaire</td>
                                            <td>
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={localSettings.notifications.email_weekly_report}
                                                        onChange={(e) => handleChange('notifications', 'email_weekly_report', e.target.checked)}
                                                    />
                                                    <span className={styles.slider}></span>
                                                </label>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ONGLET SYSTÈME */}
                    {activeTab === 'system' && (
                        <div className={styles.settingsCard}>
                            <div className={styles.cardHeader}>
                                <Monitor size={18} />
                                <h3>État du Système</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.switchRow}>
                                    <div className={styles.switchInfo}>
                                        <span className={styles.switchTitle}>Mode Maintenance</span>
                                        <span className={styles.switchDesc}>Désactiver l'accès client pour maintenance.</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.system.maintenance_mode}
                                            onChange={(e) => handleChange('system', 'maintenance_mode', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Alerte Globale</label>
                                    <textarea
                                        className={styles.textarea}
                                        rows={3}
                                        value={localSettings.system.global_alert || ''}
                                        onChange={(e) => handleChange('system', 'global_alert', e.target.value)}
                                        placeholder="Message affiché à tous les utilisateurs..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET APPARENCE */}
                    {activeTab === 'appearance' && (
                        <div className={styles.settingsCard}>
                            <div className={styles.cardHeader}>
                                <Eye size={18} />
                                <h3>Personnalisation de l'Interface</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.switchRow}>
                                    <div className={styles.switchInfo}>
                                        <span className={styles.switchTitle}>Thème Sombre</span>
                                        <span className={styles.switchDesc}>Activer le mode nuit.</span>
                                    </div>
                                    <button className={styles.themeToggleBtn} onClick={toggleTheme} style={{
                                        padding: '0.5rem 1rem',
                                        background: isDark ? '#1e293b' : '#f1f5f9',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 'bold',
                                        border: '1px solid var(--border-medium)'
                                    }}>
                                        {isDark ? <Moon size={16} /> : <Sun size={16} />}
                                        {isDark ? 'Mode Sombre' : 'Mode Clair'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET AUDIT */}
                    {activeTab === 'audit' && (
                        <div className={styles.settingsCard}>
                            <div className={styles.cardHeader}>
                                <History size={18} />
                                <h3>Journal d'Audit</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.logList}>
                                    {localSettings.audit_logs.map(log => (
                                        <div key={log.id} className={styles.logItem}>
                                            <div>
                                                <span className={styles.logUser}>{log.user}</span>
                                                <span className="mx-2 text-gray-400">•</span>
                                                <span className={styles.logAction}>{log.action}</span>
                                            </div>
                                            <span className={styles.logTime}>
                                                {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className={styles.helpText}>Seuls les 50 derniers événements sont affichés ici.</p>
                            </div>
                        </div>
                    )}

                </main>
            </div >

            {/* Sticky Save Bar */}
            < div className={styles.saveBar} >
                <button
                    className={styles.btnReset}
                    onClick={handleReset}
                    disabled={saving}
                >
                    <RotateCcw size={18} />
                    Réinitialiser
                </button>
                <button
                    className={styles.btnSave}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Enregistrement...' : (
                        <>
                            <Save size={18} />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </div >
        </div >
    );
};

export default Settings;
