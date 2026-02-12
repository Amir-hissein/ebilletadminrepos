import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, MapPin, Calendar, CreditCard,
    AlertTriangle, CheckCircle, Clock, MessageSquare, X,
    Shield, Briefcase, FileText, ExternalLink, Hash
} from 'lucide-react';
import { getComplaintById, updateComplaint } from '../../api/complaints.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './Support.module.css';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolution, setResolution] = useState('');
    const [saving, setSaving] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getComplaintById(id);
            setComplaint(result);
            if (result.resolution) setResolution(result.resolution);
        } catch (error) {
            console.error('Erreur chargement plainte:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeCharge = async () => {
        setSaving(true);
        try {
            await updateComplaint(id, { statut: 'en_traitement' });
            await loadData();
        } catch (error) {
            console.error('Erreur prise en charge:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        setSaving(true);
        try {
            await updateComplaint(id, { statut: 'annulee' });
            await loadData();
            setIsCancelModalOpen(false);
        } catch (error) {
            console.error('Erreur annulation:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleResolve = async () => {
        if (!resolution.trim()) return;
        setSaving(true);
        try {
            await updateComplaint(id, {
                resolution: resolution,
                statut: 'resolue',
                date_resolution: new Date().toISOString()
            });
            await loadData();
        } catch (error) {
            console.error('Erreur résolution:', error);
            alert('Erreur lors de la résolution');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className={styles.loading_container}>
            <div className={styles.loader}></div>
            <p>Chargement du dossier de support...</p>
        </div>
    );

    if (!complaint) return (
        <div className={styles.error_container}>
            <AlertTriangle size={48} />
            <h2>Dossier introuvable</h2>
            <button onClick={() => navigate('/support')} className={styles.action_btn_pro}>
                Retour au centre de support
            </button>
        </div>
    );

    const getStatusType = (status) => {
        switch (status) {
            case 'ouverte': return 'danger';
            case 'en_traitement': return 'warning';
            case 'resolue': return 'success';
            case 'annulee': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <div className={`fade-in ${styles.support_detail_enterprise}`}>
            {/* Header Pro */}
            <header className={styles.detail_header_pro}>
                <div className={styles.header_left}>
                    <button onClick={() => navigate('/support')} className={styles.back_pill}>
                        <ArrowLeft size={16} />
                        <span>Support</span>
                    </button>
                    <div className={styles.title_row}>
                        <div className={styles.id_badge}>#{complaint.id}</div>
                        <h1>{complaint.type_plainte}</h1>
                        <Badge type={getStatusType(complaint.statut)}>
                            {complaint.statut === 'ouverte' ? 'Ouverte' :
                                complaint.statut === 'en_traitement' ? 'En Traitement' :
                                    complaint.statut === 'resolue' ? 'Résolue' : 'Annulée'}
                        </Badge>
                    </div>
                </div>

                <div className={styles.header_actions_pro}>
                    {complaint.statut === 'ouverte' && (
                        <button
                            className={styles.btn_primary_pro}
                            onClick={handleTakeCharge}
                            disabled={saving}
                        >
                            <Clock size={16} />
                            Prendre en charge
                        </button>
                    )}
                    {complaint.statut !== 'resolue' && complaint.statut !== 'annulee' && (
                        <button
                            className={styles.btn_danger_ghost}
                            onClick={() => setIsCancelModalOpen(true)}
                            disabled={saving}
                            title="Annuler le dossier"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.detail_grid_pro}>
                {/* Left Side: Core Issue & Resolution */}
                <div className={styles.main_column}>
                    {/* Complaint Card */}
                    <div className={styles.info_card_pro}>
                        <div className={styles.card_header_pro}>
                            <div className={styles.icon_box_pro}>
                                <MessageSquare size={20} />
                            </div>
                            <h3>Détails du Litige</h3>
                            <div className={styles.header_meta}>
                                <Calendar size={14} />
                                {formatDate(complaint.created_at)}
                            </div>
                        </div>
                        <div className={styles.card_body_pro}>
                            <div className={styles.description_pro}>
                                <p>"{complaint.description}"</p>
                            </div>
                            <div className={styles.meta_grid_pro}>
                                <div className={styles.meta_item_pro}>
                                    <span className={styles.meta_label}>Priorité</span>
                                    <div className={`${styles.priority_tag} ${styles[complaint.priorite]}`}>
                                        {complaint.priorite}
                                    </div>
                                </div>
                                <div className={styles.meta_item_pro}>
                                    <span className={styles.meta_label}>Type d'entité</span>
                                    <span className={styles.meta_value}>Dossier Support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Card */}
                    <div className={`${styles.info_card_pro} ${complaint.statut === 'resolue' ? styles.success_card : ''}`}>
                        <div className={styles.card_header_pro}>
                            <div className={styles.icon_box_pro}>
                                {complaint.statut === 'resolue' ? <CheckCircle size={20} /> : <Shield size={20} />}
                            </div>
                            <h3>Résolution & Support</h3>
                        </div>
                        <div className={styles.card_body_pro}>
                            {complaint.statut === 'resolue' ? (
                                <div className={styles.resolved_content}>
                                    <div className={styles.resolution_date}>
                                        <Clock size={14} />
                                        Résolu le {formatDate(complaint.date_resolution)}
                                    </div>
                                    <p className={styles.resolution_text}>{complaint.resolution}</p>
                                </div>
                            ) : complaint.statut === 'annulee' ? (
                                <div className={styles.annulled_content}>
                                    <AlertTriangle size={20} />
                                    <p>Ce dossier a été classé sans suite.</p>
                                </div>
                            ) : (
                                <div className={styles.resolution_form}>
                                    <div className={styles.textarea_wrapper}>
                                        <label>Note de résolution officielle</label>
                                        <textarea
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            placeholder="Indiquez ici les mesures correctives apportées..."
                                            disabled={complaint.statut === 'ouverte'}
                                        />
                                        {complaint.statut === 'ouverte' && (
                                            <div className={styles.overlay_message}>
                                                Veuillez d'abord prendre en charge le dossier
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.form_actions}>
                                        <button
                                            className={styles.btn_success_pro}
                                            onClick={handleResolve}
                                            disabled={saving || !resolution.trim() || complaint.statut === 'ouverte'}
                                        >
                                            {saving ? 'Traitement...' : 'Valider la résolution'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Context & Links */}
                <div className={styles.side_column}>
                    {/* Client Info */}
                    <div className={styles.info_card_pro}>
                        <div className={styles.card_header_pro}>
                            <div className={styles.icon_box_pro}>
                                <User size={20} />
                            </div>
                            <h3>Client</h3>
                        </div>
                        <div className={styles.card_body_pro}>
                            {complaint.client ? (
                                <div className={styles.client_profile}>
                                    <div className={styles.avatar_pro}>
                                        {complaint.client.nom[0]}
                                    </div>
                                    <div className={styles.profile_info}>
                                        <h4>{complaint.client.nom} {complaint.client.prenom}</h4>
                                        <p>{complaint.client.email}</p>
                                        <span className={styles.tel_pro}>{complaint.client.telephone}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.empty_side}>Aucun client rattaché</div>
                            )}
                        </div>
                    </div>

                    {/* Context Table Card */}
                    {complaint.reservation && (
                        <div className={styles.info_card_pro}>
                            <div className={styles.card_header_pro}>
                                <div className={styles.icon_box_pro}>
                                    <Hash size={20} />
                                </div>
                                <h3>Contexte Détails</h3>
                            </div>
                            <div className={styles.card_body_pro}>
                                <div className={styles.context_list}>
                                    <div className={styles.context_item}>
                                        <span className={styles.label}>N° Réservation</span>
                                        <span className={styles.value_mono}>{complaint.reservation.numero_reservation}</span>
                                    </div>
                                    <div className={styles.context_item}>
                                        <span className={styles.label}>Montant</span>
                                        <span className={styles.value_bold}>{formatCurrency(complaint.reservation.prix_total)}</span>
                                    </div>
                                    <div className={styles.context_item}>
                                        <span className={styles.label}>Voyage</span>
                                        <span className={styles.value}>
                                            {complaint.reservation.voyage?.ville_depart_nom} → {complaint.reservation.voyage?.ville_arrivee_nom}
                                        </span>
                                    </div>
                                    <div className={styles.context_item}>
                                        <span className={styles.label}>Agence</span>
                                        <span className={styles.value}>{complaint.agence?.nom || 'Canal Direct'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/reservations/${complaint.reservation.id}`)}
                                    className={styles.view_full_link}
                                >
                                    <span>Voir la réservation</span>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancel}
                title="Annuler la plainte"
                message={`Voulez-vous vraiment annuler/rejeter définitivement cette plainte ? Cette action classera le dossier sans suite.`}
                confirmLabel="Confirmer l'annulation"
            />
        </div >
    );
};

export default ComplaintDetail;
