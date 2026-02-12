import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Check, X, Clock, AlertTriangle,
    User, Building, FileText, CheckCircle, ArrowLeft
} from 'lucide-react';
import { getCriticalActions, validateCriticalAction, rejectCriticalAction } from '../../api/critical-actions.api';
import { formatDate } from '../../utils/formatters';
import styles from './CriticalActions.module.css';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';

const CriticalActions = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID de l'action en cours
    const [confirmModal, setConfirmModal] = useState({ open: false, actionId: null });

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

    const handleValidate = async () => {
        if (!confirmModal.actionId) return;

        const id = confirmModal.actionId;
        setProcessing(id);
        setConfirmModal({ open: false, actionId: null });

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
            case 'bloquer_agence': return <ShieldAlert size={24} />;
            case 'valider_agence': return <Building size={24} />;
            case 'rembourser_client': return <AlertTriangle size={24} />;
            default: return <FileText size={24} />;
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
            {/* Premium Gradient Header */}
            <div className={styles.validationHeader}>
                <div className={styles.headerMain}>
                    <div className={styles.greeting_row}>
                        <h1 className={styles.pageTitle}>Validation des Actions</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système de Contrôle Live</span>
                        </div>
                    </div>
                    <p className={styles.pageSubtitle}>Gérez les demandes sensibles et les opérations critiques des sous-administrateurs.</p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <Clock size={16} />
                        En Attente
                        {actions.length > 0 && activeTab === 'pending' && (
                            <span className={styles.badge_count}>
                                {actions.length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <Clock size={16} className="rotate-180" />
                        Historique
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading_container}>
                    <div className={styles.loader_pro}></div>
                    <p>Chargement des actions en cours...</p>
                </div>
            ) : actions.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.empty_icon_wrapper}>
                        <CheckCircle size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">Tout est à jour</h3>
                    <p className="text-gray-500 font-medium">Aucune action {activeTab === 'pending' ? 'en attente' : 'dans l\'historique'} de validation.</p>
                </div>
            ) : (
                <div className={styles.actions_list_pro}>
                    {actions.map(action => (
                        <div key={action.id} className={styles.actionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerLeft}>
                                    <div className={`${styles.iconWrapper} ${styles[getActionColor(action.type_action)]}`}>
                                        {getActionIcon(action.type_action)}
                                    </div>
                                    <div className={styles.title_block}>
                                        <h3 className={styles.actionTitle}>{formatActionName(action.type_action)}</h3>
                                        <div className={styles.actionMeta}>
                                            <div className={styles.meta_item}>
                                                <User size={14} />
                                                <span>Demandé par <strong>{action.demandeur?.nom} {action.demandeur?.prenom}</strong></span>
                                            </div>
                                            <div className={styles.meta_divider}></div>
                                            <div className={styles.meta_item}>
                                                <Clock size={14} />
                                                <span>{formatDate(action.date_demande)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {activeTab === 'history' && (
                                    <div className={`${styles.statusBadge} ${styles[action.statut === 'validee' ? 'approved' : 'rejected']}`}>
                                        {action.statut === 'validee' ? (
                                            <><Check size={14} /> <span>Action Validée</span></>
                                        ) : (
                                            <><X size={14} /> <span>Action Rejetée</span></>
                                        )}
                                    </div>
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
                                        <div className="capitalize text-sm font-medium bg-gray-100 px-2 py-1 rounded inline-block text-gray-700">{action.entite_type}</div>
                                    </div>
                                </div>

                                <div className={styles.descriptionBox}>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        Justification / Description
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-6">
                                        {action.description}
                                    </p>

                                    {/* Données spécifiques si présentes */}
                                    {action.donnees_action && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 pl-6">
                                            {Object.entries(action.donnees_action).map(([key, value]) => (
                                                <div key={key} className="text-xs text-gray-500 mb-1">
                                                    <span className="font-semibold text-gray-700 uppercase tracking-wide mr-2">{key}:</span>
                                                    {value.toString()}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'history' && action.statut === 'rejetee' && (
                                    <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 border border-red-100 flex items-start gap-3">
                                        <X size={18} className="mt-0.5 text-red-600 shrink-0" />
                                        <div>
                                            <span className="font-bold block mb-1">Motif du rejet :</span>
                                            {action.motif_rejet}
                                        </div>
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
                                        onClick={() => setConfirmModal({ open: true, actionId: action.id })}
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

            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, actionId: null })}
                onConfirm={handleValidate}
                title="Valider l'action critique"
                message="Êtes-vous sûr de vouloir valider cette action critique ? Cette opération aura un impact immédiat sur le système."
                confirmLabel="Valider l'action"
            />
        </div>
    );
};

export default CriticalActions;
