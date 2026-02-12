import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, Shield,
    Building2, Calendar, Edit, Trash2,
    User as UserIcon, Clock, ShieldCheck,
    CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { getUserById, updateUserStatus, deleteUser } from '../../api/users.api';
import { ROLE_NAMES, USER_STATUS_LABELS } from '../../utils/constants';
import { formatDate, getInitials } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './UserDetail.module.css';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const data = await getUserById(id);
                setUser(data);
            } catch (err) {
                console.error('Erreur chargement utilisateur:', err);
                setError('Impossible de charger les détails de l\'utilisateur.');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadUser();
    }, [id]);

    const handleToggleStatus = async () => {
        const newStatut = user.statut === 'actif' ? 'suspendu' : 'actif';
        try {
            await updateUserStatus(user.id, newStatut);
            setUser({ ...user, statut: newStatut });
        } catch (err) {
            alert('Erreur lors du changement de statut');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser(user.id);
            navigate('/users');
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    if (loading) return <div className={styles.loading}>Chargement de l'utilisateur...</div>;
    if (error || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>{error || 'Utilisateur non trouvé'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/users')}>
                        Retour à la liste
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusVariant = (statut) => {
        const variants = {
            actif: 'success',
            suspendu: 'danger',
            inactif: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    return (
        <div className={`fade-in ${styles.container}`}>
            {/* Immersive Header */}
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <button className={styles.backButton} onClick={() => navigate('/users')}>
                        <ArrowLeft size={16} /> <span>Retour</span>
                    </button>
                    <h1 className={styles.title}>
                        <UserIcon size={28} />
                        Détails du Profil
                    </h1>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        icon={user.statut === 'actif' ? XCircle : CheckCircle2}
                        onClick={handleToggleStatus}
                    >
                        {user.statut === 'actif' ? 'Suspendre' : 'Réactiver'}
                    </Button>
                    <Button icon={Edit} onClick={() => navigate(`/users/${id}/edit`)}>
                        Modifier
                    </Button>
                    <Button
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setIsDeleteModalOpen(true)}
                        style={{ border: 'none', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                    />
                </div>
            </header>

            <div className={styles.card}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarLarge}>
                        {getInitials(user.prenom, user.nom)}
                    </div>
                    <div className={styles.profileInfo}>
                        <div className={styles.flex_center_gap_3} style={{ marginBottom: '0.25rem' }}>
                            <h2 className={styles.userName}>{user.prenom} {user.nom}</h2>
                            <Badge variant={getStatusVariant(user.statut)}>
                                {USER_STATUS_LABELS[user.statut]}
                            </Badge>
                        </div>
                        <span className={styles.userEmail}>{user.email}</span>
                        <div className={styles.flex_center_gap_2} style={{ marginTop: '0.75rem' }}>
                            <Badge variant="primary">{ROLE_NAMES[user.role_id]}</Badge>
                            {user.agence_nom && <Badge variant="neutral">{user.agence_nom}</Badge>}
                        </div>
                    </div>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Informations de Contact</span>
                        <div className={styles.infoValue}><Mail size={18} /> {user.email}</div>
                        <div className={styles.infoValue}><Phone size={18} /> {user.telephone}</div>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Accès & Permissions</span>
                        <div className={styles.infoValue}><Shield size={18} /> {ROLE_NAMES[user.role_id]}</div>
                        <div className={styles.infoValue}><ShieldCheck size={18} /> Niveau: Admin {user.niveau_acces || 'Standard'}</div>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Organisation</span>
                        <div className={styles.infoValue}>
                            <Building2 size={18} />
                            {user.agence_nom || 'Plateforme Zentrale'}
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Historique Compte</span>
                        <div className={styles.infoValue}><Calendar size={18} /> Créé le {formatDate(user.created_at)}</div>
                        <div className={styles.infoValue}>
                            <Clock size={18} />
                            {user.derniere_connexion ? `Vu le ${formatDate(user.derniere_connexion)}` : 'Jamais connecté'}
                        </div>
                    </div>
                </div>

                {user.types_sous_admin && user.types_sous_admin.length > 0 && (
                    <div className={styles.sub_admin_section}>
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Domaines de responsabilité (Sous-Admin)</h3>
                        <div className={styles.flex_wrap_gap_3}>
                            {user.types_sous_admin.map(type => (
                                <div key={type} style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', border: '1px solid var(--primary-100)' }}>
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Supprimer l'utilisateur"
                message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.prenom} ${user.nom}" ? Cette action révoquera tous ses accès.`}
                confirmLabel="Supprimer définitivement"
            />
        </div>
    );
};

export default UserDetail;
