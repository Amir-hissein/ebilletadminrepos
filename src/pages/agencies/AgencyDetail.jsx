import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Bus,
    Ticket,
    CreditCard,
    Star,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    User
} from 'lucide-react';
import { getAgencyById, updateAgencyStatus } from '../../api/agencies.api';
import { AGENCY_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import styles from './AgencyDetail.module.css';

function AgencyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        loadAgency();
    }, [id]);

    const loadAgency = async () => {
        setLoading(true);
        try {
            const data = await getAgencyById(id);
            setAgency(data);
        } catch (error) {
            console.error('Erreur chargement agence:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        try {
            await updateAgencyStatus(id, newStatus);
            setAgency(prev => ({ ...prev, statut: newStatus }));
        } catch (error) {
            console.error('Erreur changement statut:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const getStatusVariant = (statut) => {
        const variants = {
            actif: 'success',
            suspendu: 'danger',
            en_attente: 'warning',
            inactif: 'neutral'
        };
        return variants[statut] || 'neutral';
    };

    if (loading) {
        return (
            <div className={styles['agency-detail__loading']}>
                Chargement des informations...
            </div>
        );
    }

    if (!agency) {
        return (
            <div className={styles['agency-detail__loading']}>
                Agence non trouvée
            </div>
        );
    }

    return (
        <div className={styles['agency-detail']}>
            {/* Header with Gradient */}
            <div className={styles['agency-detail__header']}>
                <div className={styles['agency-detail__info']}>
                    <div className={styles['agency-detail__avatar']}>
                        {getInitials(agency.nom)}
                    </div>
                    <div className={styles['agency-detail__title']}>
                        <h1>{agency.nom}</h1>
                        <div className={styles['agency-detail__meta']}>
                            <Badge variant={getStatusVariant(agency.statut)} dot>
                                {AGENCY_STATUS_LABELS[agency.statut]}
                            </Badge>
                            <span className={styles['agency-detail__location']}>
                                <MapPin size={14} />
                                {agency.adresse}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles['agency-detail__actions']}>
                    <button
                        className={styles['agency-detail__back-btn']}
                        onClick={() => navigate('/agencies')}
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>
                    <button
                        className={styles['agency-detail__edit-btn']}
                        onClick={() => navigate(`/agencies/${id}/edit`)}
                    >
                        <Edit size={18} />
                        Modifier
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles['agency-detail__stats']}>
                <div className={`${styles['agency-detail__stat-card']} ${styles['agency-detail__stat-card--primary']}`}>
                    <div className={`${styles['agency-detail__stat-icon']} ${styles['agency-detail__stat-icon--primary']}`}>
                        <Bus size={24} />
                    </div>
                    <div className={styles['agency-detail__stat-value']}>{agency.nombre_vehicules}</div>
                    <div className={styles['agency-detail__stat-label']}>Véhicules</div>
                </div>

                <div className={`${styles['agency-detail__stat-card']} ${styles['agency-detail__stat-card--success']}`}>
                    <div className={`${styles['agency-detail__stat-icon']} ${styles['agency-detail__stat-icon--success']}`}>
                        <Ticket size={24} />
                    </div>
                    <div className={styles['agency-detail__stat-value']}>{agency.nombre_voyages_mois}</div>
                    <div className={styles['agency-detail__stat-label']}>Voyages ce mois</div>
                </div>

                <div className={`${styles['agency-detail__stat-card']} ${styles['agency-detail__stat-card--warning']}`}>
                    <div className={`${styles['agency-detail__stat-icon']} ${styles['agency-detail__stat-icon--warning']}`}>
                        <CreditCard size={24} />
                    </div>
                    <div className={styles['agency-detail__stat-value']}>{formatCurrency(agency.revenus_mois)}</div>
                    <div className={styles['agency-detail__stat-label']}>Revenus ce mois</div>
                </div>

                <div className={`${styles['agency-detail__stat-card']} ${styles['agency-detail__stat-card--danger']}`}>
                    <div className={`${styles['agency-detail__stat-icon']} ${styles['agency-detail__stat-icon--danger']}`}>
                        <Star size={24} />
                    </div>
                    <div className={styles['agency-detail__stat-value']}>
                        {agency.note_moyenne > 0 ? agency.note_moyenne.toFixed(1) : '—'}
                    </div>
                    <div className={styles['agency-detail__stat-label']}>Note moyenne</div>
                </div>
            </div>

            {/* Content */}
            <div className={styles['agency-detail__content']}>
                {/* Main Info Card */}
                <div className={styles['agency-detail__card']}>
                    <div className={styles['agency-detail__card-header']}>
                        <div className={styles['agency-detail__card-header-icon']}>
                            <Building2 size={18} />
                        </div>
                        <span className={styles['agency-detail__card-title']}>Informations de l'agence</span>
                    </div>
                    <div className={styles['agency-detail__card-body']}>
                        {/* Contact Section */}
                        <div className={styles['agency-detail__section']}>
                            <h3 className={styles['agency-detail__section-title']}>Contact</h3>
                            <div className={styles['agency-detail__info-grid']}>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']}>
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Téléphone</span>
                                        <span className={styles['agency-detail__info-value']}>
                                            <a href={`tel:${agency.telephone}`}>{agency.telephone}</a>
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']}>
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Email</span>
                                        <span className={styles['agency-detail__info-value']}>
                                            <a href={`mailto:${agency.email}`}>{agency.email}</a>
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']}>
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Adresse</span>
                                        <span className={styles['agency-detail__info-value']}>{agency.adresse}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Responsable Section */}
                        <div className={styles['agency-detail__section']}>
                            <h3 className={styles['agency-detail__section-title']}>Responsable</h3>
                            <div className={styles['agency-detail__info-grid']}>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']} style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}>
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Nom complet</span>
                                        <span className={styles['agency-detail__info-value']}>
                                            {agency.responsable_prenom} {agency.responsable_nom}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']} style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}>
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Téléphone</span>
                                        <span className={styles['agency-detail__info-value']}>
                                            <a href={`tel:${agency.responsable_telephone}`}>
                                                {agency.responsable_telephone}
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Paramètres Section */}
                        <div className={styles['agency-detail__section']}>
                            <h3 className={styles['agency-detail__section-title']}>Paramètres</h3>
                            <div className={styles['agency-detail__info-grid']}>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']} style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}>
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Taux de commission</span>
                                        <span className={styles['agency-detail__info-value']}>{agency.taux_commission}%</span>
                                    </div>
                                </div>
                                <div className={styles['agency-detail__info-item']}>
                                    <div className={styles['agency-detail__info-icon']} style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}>
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <span className={styles['agency-detail__info-label']}>Date d'inscription</span>
                                        <span className={styles['agency-detail__info-value']}>
                                            {formatDate(agency.date_creation)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Actions */}
                <div className={styles['agency-detail__actions-card']}>
                    <div className={styles['agency-detail__card-header']}>
                        <div className={styles['agency-detail__card-header-icon']} style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}>
                            <Clock size={18} />
                        </div>
                        <span className={styles['agency-detail__card-title']}>Actions rapides</span>
                    </div>
                    <div className={styles['agency-detail__card-body']}>
                        <div className={styles['agency-detail__status-actions']}>
                            {agency.statut !== 'actif' && (
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    icon={CheckCircle}
                                    loading={statusLoading}
                                    onClick={() => handleStatusChange('actif')}
                                >
                                    Activer l'agence
                                </Button>
                            )}

                            {agency.statut === 'actif' && (
                                <Button
                                    variant="danger"
                                    fullWidth
                                    icon={XCircle}
                                    loading={statusLoading}
                                    onClick={() => handleStatusChange('suspendu')}
                                >
                                    Suspendre l'agence
                                </Button>
                            )}

                            {agency.statut === 'en_attente' && (
                                <Button
                                    variant="danger"
                                    fullWidth
                                    icon={XCircle}
                                    loading={statusLoading}
                                    onClick={() => handleStatusChange('inactif')}
                                >
                                    Refuser l'agence
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgencyDetail;
