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
import styles from './UserDetail.module.css';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await deleteUser(user.id);
                navigate('/users');
            } catch (err) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    if (loading) return <div className={styles.loading}>Chargement de l'utilisateur...</div>;
    if (error || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
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
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <button className={styles.backButton} onClick={() => navigate('/users')}>
                        <ArrowLeft size={16} className="mr-1" /> Retour aux utilisateurs
                    </button>
                    <h1 className={styles.title}>
                        <UserIcon size={24} /> Profil Utilisateur
                        <Badge variant={getStatusVariant(user.statut)} dot>
                            {USER_STATUS_LABELS[user.statut]}
                        </Badge>
                    </h1>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="outline"
                        icon={user.statut === 'actif' ? XCircle : CheckCircle2}
                        onClick={handleToggleStatus}
                    >
                        {user.statut === 'actif' ? 'Suspendre' : 'Réactiver'}
                    </Button>
                    <Button icon={Edit} onClick={() => navigate(`/users/${id}/edit`)}>
                        Modifier
                    </Button>
                    <Button variant="outline" icon={Trash2} onClick={handleDelete} className="text-red-500 hover:border-red-500 hover:bg-red-50" />
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarLarge}>
                            {getInitials(user.prenom, user.nom)}
                        </div>
                        <div className={styles.profileInfo}>
                            <h2 className={styles.userName}>{user.prenom} {user.nom}</h2>
                            <span className={styles.userEmail}>{user.email}</span>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="primary">{ROLE_NAMES[user.role_id]}</Badge>
                                {user.agence_nom && <Badge variant="neutral">{user.agence_nom}</Badge>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Coordonnées</span>
                            <div className={styles.infoValue}><Mail size={16} className="text-gray-400" /> {user.email}</div>
                            <div className={styles.infoValue}><Phone size={16} className="text-gray-400" /> {user.telephone}</div>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Rôle & Permissions</span>
                            <div className={styles.infoValue}><Shield size={16} className="text-gray-400" /> {ROLE_NAMES[user.role_id]}</div>
                            <div className={styles.infoValue}><ShieldCheck size={16} className="text-gray-400" /> Niveau d'accès: {user.niveau_acces}</div>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Organisation</span>
                            {user.agence_id ? (
                                <div className={styles.infoValue}><Building2 size={16} className="text-gray-400" /> {user.agence_nom}</div>
                            ) : (
                                <div className={styles.infoValue}>Plateforme E-Billet Centrale</div>
                            )}
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Activité</span>
                            <div className={styles.infoValue}><Calendar size={16} className="text-gray-400" /> Créé le {formatDate(user.created_at)}</div>
                            <div className={styles.infoValue}>
                                <Clock size={16} className="text-gray-400" />
                                {user.derniere_connexion ? `Dernière connexion le ${formatDate(user.derniere_connexion)}` : 'Aucune connexion enregistrée'}
                            </div>
                        </div>
                    </div>

                    {user.types_sous_admin && user.types_sous_admin.length > 0 && (
                        <div className="mt-8 pt-8 border-top border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Responsabilités Sous-Admin</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.types_sous_admin.map(type => (
                                    <Badge key={type} variant="outline" className="capitalize">{type}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
