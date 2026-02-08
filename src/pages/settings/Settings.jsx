import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Globe, CreditCard, Shield,
    Save, RotateCcw, Monitor, AlertTriangle,
    Mail, Phone, MapPin, Share2, Sun, Moon
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
            // Dans la démo, on simule la sauvegarde de l'onglet actif
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

    return (
        <div className={`fade-in ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Configuration Système</h1>
                <p className={styles.subtitle}>Gérez les paramètres globaux de la plateforme E-Billet</p>
            </div>

            {message && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertWarning
                    }`}>
                    {message.type === 'success' ? <p>{message.text}</p> : <p>{message.text}</p>}
                </div>
            )}

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'platform' ? styles.tab_active : ''}`}
                    onClick={() => setActiveTab('platform')}
                >
                    <Globe size={18} className="inline mr-2" />
                    Plateforme
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'finance' ? styles.tab_active : ''}`}
                    onClick={() => setActiveTab('finance')}
                >
                    <CreditCard size={18} className="inline mr-2" />
                    Finance
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'system' ? styles.tab_active : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    <Shield size={18} className="inline mr-2" />
                    Système
                </button>
            </div>

            <div className={styles.sections}>
                {/* ONGLET PLATEFORME */}
                {activeTab === 'platform' && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Identification</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Nom de la plateforme</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={localSettings.platform.name}
                                        onChange={(e) => handleChange('platform', 'name', e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email de contact</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            className={`${styles.input} pl-10`}
                                            value={localSettings.platform.email_contact}
                                            onChange={(e) => handleChange('platform', 'email_contact', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Téléphone</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            className={`${styles.input} pl-10`}
                                            value={localSettings.platform.phone_contact}
                                            onChange={(e) => handleChange('platform', 'phone_contact', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Adresse physique</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            className={`${styles.input} pl-10`}
                                            value={localSettings.platform.address}
                                            onChange={(e) => handleChange('platform', 'address', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ONGLET FINANCE */}
                {activeTab === 'finance' && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Paramètres Financiers</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Commission par défaut (%)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={localSettings.finance.default_commission_rate}
                                        onChange={(e) => handleChange('finance', 'default_commission_rate', parseInt(e.target.value))}
                                    />
                                    <span className={styles.description}>S'applique aux nouvelles agences créées</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Seuil de retrait minimum (FCFA)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={localSettings.finance.min_withdrawal_amount}
                                        onChange={(e) => handleChange('finance', 'min_withdrawal_amount', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Devise principale</label>
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
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Numéro d'identification fiscale</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={localSettings.finance.tax_id}
                                        onChange={(e) => handleChange('finance', 'tax_id', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ONGLET SYSTÈME */}
                {activeTab === 'system' && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>État du Système</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.sections}>
                                {/* Toggle Mode Sombre */}
                                <div className={styles.toggleRow}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.toggleTitle}>
                                            {isDark ? <Moon size={18} className="inline mr-2" /> : <Sun size={18} className="inline mr-2" />}
                                            Mode Sombre
                                        </span>
                                        <span className={styles.description}>Basculer entre le thème clair et sombre</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={isDark}
                                            onChange={toggleTheme}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleRow}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.toggleTitle}>Mode Maintenance</span>
                                        <span className={styles.description}>Désactive l'accès public à la plateforme</span>
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

                                {localSettings.system.maintenance_mode && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Message de maintenance</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={localSettings.system.maintenance_message}
                                            onChange={(e) => handleChange('system', 'maintenance_message', e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className={styles.toggleRow}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.toggleTitle}>Inscriptions Ouvertes</span>
                                        <span className={styles.description}>Permet aux nouvelles agences de s'inscrire</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.system.registration_open}
                                            onChange={(e) => handleChange('system', 'registration_open', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Alerte Globale (Optionnel)</label>
                                    <div className="relative">
                                        <AlertTriangle size={16} className="absolute left-3 top-3 text-orange-400" />
                                        <textarea
                                            className={`${styles.textarea} pl-10`}
                                            placeholder="Ex: Mise à jour prévue ce dimanche à 22h..."
                                            value={localSettings.system.global_alert || ''}
                                            onChange={(e) => handleChange('system', 'global_alert', e.target.value)}
                                        />
                                    </div>
                                    <span className={styles.description}>S'affiche sur le dashboard de tous les utilisateurs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.saveBar}>
                <button
                    className={styles.btnReset}
                    onClick={handleReset}
                    disabled={saving}
                >
                    <RotateCcw size={18} className="inline mr-2" />
                    Annuler
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
            </div>
        </div>
    );
};

export default Settings;
