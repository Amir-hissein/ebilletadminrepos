import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Check, X, Clock, AlertTriangle,
    User, Building, FileText, CheckCircle
} from 'lucide-react';
import { getCriticalActions, validateCriticalAction, rejectCriticalAction } from '../../api/critical-actions.api';
import { formatDate } from '../../utils/formatters';
import styles from './CriticalActions.module.css';

const CriticalActions = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID de l'action en cours

    useEffect(() => {
        loadActions();
    }, [activeTab]);

    const loadActions = async () => {
        setLoading(true);
        try {
            const filters = activeTab === 'pending'
                ? { statut: 'en_attente' }
                : {}; // Pour l'historique, on pourrait filtrer 'validee' ou 'rejetee'

            const result = await getCriticalActions(filters);

            // Si on est dans l'historique, on filtre localement ce qui n'est pas en attente
            // (L'API de démo est simple, en réel le backend filtrerait mieux)
            const filteredData = activeTab === 'pending'
                ? result.data
                : result.data.filter(a => a.statut !== 'en_attente');

            setActions(filteredData);
        } catch (error) {
            console.error('Erreur chargement actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir valider cette action critique ?')) return;

        setProcessing(id);
        try {
            await validateCriticalAction(id, 1); // 1 = ID Super Admin (simulé)
            await loadActions();
        } catch (error) {
            alert("Erreur lors de la validation");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id) => {
        const motif = window.prompt("Motif du rejet (obligatoire) :");
        if (!motif) return;

        setProcessing(id);
        try {
            await rejectCriticalAction(id, 1, motif);
            await loadActions();
        } catch (error) {
            alert("Erreur lors du rejet");
        } finally {
            setProcessing(null);
        }
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'bloquer_agence': return <ShieldAlert size={20} />;
            case 'valider_agence': return <Building size={20} />;
            case 'rembourser_client': return <AlertTriangle size={20} />;
            default: return <FileText size={20} />;
        }
    };

    const getActionColor = (type) => {
        switch (type) {
            case 'bloquer_agence': return 'danger';
            case 'supprimer_voyage': return 'danger';
            case 'rembourser_client': return 'warning';
            default: return 'info';
        }
    };

    const formatActionName = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className={`fade-in ${styles.container}`}>
            <div className="mb-8">
                <h1 className="page-title">Validation des Actions Critiques</h1>
                <p className="page-subtitle">Validez ou rejetez les demandes sensibles des sous-administrateurs</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    En Attente
                    {activeTab === 'pending' && actions.length > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                            {actions.length}
                        </span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historique
                </button>
            </div>

            {loading ? (
                <div className="text-center p-12 text-gray-500">Chargement...</div>
            ) : actions.length === 0 ? (
                <div className={styles.emptyState}>
                    <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>Aucune action {activeTab === 'pending' ? 'en attente' : 'dans l\'historique'}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {actions.map(action => (
                        <div key={action.id} className={styles.actionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerLeft}>
                                    <div className={`${styles.iconWrapper} ${styles[getActionColor(action.type_action)]}`}>
                                        {getActionIcon(action.type_action)}
                                    </div>
                                    <div>
                                        <h3 className={styles.actionTitle}>{formatActionName(action.type_action)}</h3>
                                        <div className={styles.actionMeta}>
                                            Demandé par <strong>{action.demandeur?.nom} {action.demandeur?.prenom}</strong> • {formatDate(action.date_demande)}
                                        </div>
                                    </div>
                                </div>
                                {activeTab === 'history' && (
                                    <span className={`${styles.statusBadge} ${styles[action.statut === 'validee' ? 'approved' : 'rejected']}`}>
                                        {action.statut === 'validee' ? (
                                            <><Check size={14} /> Validée</>
                                        ) : (
                                            <><X size={14} /> Rejetée</>
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.dataGrid}>
                                    <div>
                                        <div className={styles.dataLabel}>Cible</div>
                                        <div className={styles.dataValue}>{action.entite_nom}</div>
                                    </div>
                                    <div>
                                        <div className={styles.dataLabel}>Type Entité</div>
                                        <div className="capitalize text-sm">{action.entite_type}</div>
                                    </div>
                                </div>

                                <div className={styles.descriptionBox}>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Justification / Description</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {action.description}
                                    </p>

                                    {/* Données spécifiques si présentes */}
                                    {action.donnees_action && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            {Object.entries(action.donnees_action).map(([key, value]) => (
                                                <div key={key} className="text-xs text-gray-500">
                                                    <span className="font-medium">{key}:</span> {value.toString()}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'history' && action.statut === 'rejetee' && (
                                    <div className="bg-red-50 p-3 rounded text-sm text-red-700 border border-red-100">
                                        <strong>Motif du rejet :</strong> {action.motif_rejet}
                                    </div>
                                )}
                            </div>

                            {activeTab === 'pending' && (
                                <div className={styles.cardFooter}>
                                    <button
                                        className={`${styles.btnAction} ${styles.btnReject}`}
                                        onClick={() => handleReject(action.id)}
                                        disabled={processing === action.id}
                                    >
                                        <X size={16} />
                                        Rejeter
                                    </button>
                                    <button
                                        className={`${styles.btnAction} ${styles.btnValidate}`}
                                        onClick={() => handleValidate(action.id)}
                                        disabled={processing === action.id}
                                    >
                                        {processing === action.id ? 'Traitement...' : (
                                            <><Check size={16} /> Valider l'action</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CriticalActions;
