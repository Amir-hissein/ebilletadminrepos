import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Mail,
    Send,
    CheckCircle,
    Copy,
    User,
    Upload,
    Image,
    X
} from 'lucide-react';
import { createAgency, getAgencyById, updateAgency } from '../../api/agencies.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import styles from './AgencyForm.module.css';

function AgencyForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [success, setSuccess] = useState(false);
    const [invitationLink, setInvitationLink] = useState('');
    const [errors, setErrors] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [formData, setFormData] = useState({
        // Informations agence
        nom: '',
        adresse: '',
        telephone: '',
        email: '',

        // Responsable / Admin de l'agence
        responsable_nom: '',
        responsable_prenom: '',
        responsable_telephone: '',
        responsable_email: '', // Email pour l'invitation

        // Paramètres
        taux_commission: 10,
        description: ''
    });

    // Charger les données de l'agence en mode édition
    useEffect(() => {
        if (isEditMode) {
            loadAgencyData();
        }
    }, [id]);

    const loadAgencyData = async () => {
        try {
            setLoadingData(true);
            const agency = await getAgencyById(id);
            setFormData({
                nom: agency.nom || '',
                adresse: agency.adresse || '',
                telephone: agency.telephone || '',
                email: agency.email || '',
                responsable_nom: agency.responsable?.nom || agency.responsable_nom || '',
                responsable_prenom: agency.responsable?.prenom || agency.responsable_prenom || '',
                responsable_telephone: agency.responsable?.telephone || agency.responsable_telephone || '',
                responsable_email: agency.responsable?.email || agency.responsable_email || '',
                taux_commission: agency.commission_pourcentage || agency.taux_commission || 10,
                description: agency.description || ''
            });
            if (agency.logo) {
                setLogoPreview(agency.logo);
            }
        } catch (error) {
            console.error('Erreur chargement agence:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, logo: 'Le fichier doit être une image' }));
                return;
            }
            // Vérifier la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, logo: 'L\'image ne doit pas dépasser 2 Mo' }));
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, logo: null }));
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nom.trim()) {
            newErrors.nom = 'Le nom de l\'agence est requis';
        }
        if (!formData.adresse.trim()) {
            newErrors.adresse = 'L\'adresse est requise';
        }
        if (!formData.telephone.trim()) {
            newErrors.telephone = 'Le téléphone est requis';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!formData.responsable_nom.trim()) {
            newErrors.responsable_nom = 'Le nom du responsable est requis';
        }
        if (!formData.responsable_prenom.trim()) {
            newErrors.responsable_prenom = 'Le prénom du responsable est requis';
        }
        if (!formData.responsable_email.trim()) {
            newErrors.responsable_email = 'L\'email du responsable est requis (pour l\'invitation)';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.responsable_email)) {
            newErrors.responsable_email = 'Email invalide';
        }

        // Logo obligatoire
        if (!logoFile) {
            newErrors.logo = 'Le logo de l\'agence est obligatoire';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            if (isEditMode) {
                // Mode édition - mettre à jour l'agence existante
                await updateAgency(id, formData);
                navigate(`/agencies/${id}`);
            } else {
                // Mode création
                const result = await createAgency(formData);

                // Générer le lien d'invitation (en mode démo, on simule)
                const inviteToken = btoa(`${result.id}-${Date.now()}`);
                const link = `${window.location.origin}/invite/${inviteToken}`;
                setInvitationLink(link);
                setSuccess(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setErrors({ submit: isEditMode ? 'Une erreur est survenue lors de la mise à jour' : 'Une erreur est survenue lors de la création' });
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(invitationLink);
        alert('Lien copié !');
    };

    if (success) {
        return (
            <div className={styles['agency-form']}>
                <div className={styles['agency-form__success-container']}>
                    {/* Success Header */}
                    <div className={styles['agency-form__success-header']}>
                        <div className={styles['agency-form__success-icon']}>
                            <CheckCircle size={36} />
                        </div>
                        <h2 className={styles['agency-form__success-title']}>
                            Agence créée avec succès !
                        </h2>
                        <p className={styles['agency-form__success-subtitle']}>
                            L'invitation a été envoyée par email
                        </p>
                    </div>

                    {/* Success Body */}
                    <div className={styles['agency-form__success-body']}>
                        {/* Email Badge */}
                        <div className={styles['agency-form__email-badge']}>
                            <div className={styles['agency-form__email-badge-icon']}>
                                <Mail size={16} />
                            </div>
                            <div className={styles['agency-form__email-badge-text']}>
                                <span className={styles['agency-form__email-badge-label']}>Email envoyé à</span>
                                <span className={styles['agency-form__email-badge-value']}>{formData.responsable_email}</span>
                            </div>
                        </div>

                        {/* Info Text */}
                        <p className={styles['agency-form__info-text']}>
                            L'administrateur de l'agence recevra un email avec ses identifiants de connexion.
                            Il devra changer son mot de passe lors de la première connexion.
                        </p>

                        {/* Invitation Link */}
                        <div className={styles['agency-form__invitation-section']}>
                            <label className={styles['agency-form__invitation-label']}>
                                Lien d'invitation
                            </label>
                            <div className={styles['agency-form__invitation-link']}>
                                <span className={styles['agency-form__invitation-link-text']}>
                                    {invitationLink}
                                </span>
                                <button
                                    className={styles['agency-form__invitation-link-copy']}
                                    onClick={copyLink}
                                >
                                    <Copy size={16} />
                                    Copier
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles['agency-form__success-actions']}>
                            <Button variant="secondary" icon={Mail}>
                                Renvoyer l'email
                            </Button>
                            <Button onClick={() => navigate('/agencies')}>
                                Voir les agences
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['agency-form']}>
            {/* Header with Gradient */}
            <div className={styles['agency-form__header']}>
                <button
                    className={styles['agency-form__back-btn']}
                    onClick={() => navigate('/agencies')}
                    type="button"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className={styles['agency-form__title']}>
                    {isEditMode ? 'Modifier l\'agence' : 'Nouvelle Agence'}
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <Card.Body>
                        {/* Section Logo */}
                        <div className={styles['agency-form__section']}>
                            <h2 className={styles['agency-form__section-title']}>
                                <Image size={20} style={{ marginRight: '8px' }} />
                                Logo de l'agence
                            </h2>

                            <div className={styles['agency-form__field']}>
                                <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                    Logo
                                </label>
                                <div
                                    className={`${styles['agency-form__logo-upload']} ${errors.logo ? styles['agency-form__logo-upload--error'] : ''} ${logoPreview ? styles['agency-form__logo-upload--has-file'] : ''}`}
                                >
                                    <div className={styles['agency-form__logo-preview']}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" />
                                        ) : (
                                            <div className={styles['agency-form__logo-placeholder']}>
                                                <Image size={32} />
                                                <span style={{ fontSize: '12px' }}>120x120</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles['agency-form__logo-content']}>
                                        <div className={styles['agency-form__logo-title']}>
                                            {logoPreview ? 'Logo sélectionné' : 'Ajouter le logo de l\'agence'}
                                        </div>
                                        <p className={styles['agency-form__logo-description']}>
                                            {logoPreview
                                                ? logoFile?.name
                                                : 'Glissez-déposez ou cliquez pour sélectionner'
                                            }
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <label className={styles['agency-form__logo-btn']}>
                                                <Upload size={16} />
                                                {logoPreview ? 'Changer' : 'Parcourir'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className={styles['agency-form__logo-input']}
                                                    onChange={handleLogoChange}
                                                />
                                            </label>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={removeLogo}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '8px 12px',
                                                        background: 'var(--danger-50)',
                                                        color: 'var(--danger-500)',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: '14px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={16} />
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>
                                        <p className={styles['agency-form__logo-formats']}>
                                            Formats acceptés: PNG, JPG, WEBP (max 2 Mo)
                                        </p>
                                    </div>
                                </div>
                                {errors.logo && <span className={styles['agency-form__error']}>{errors.logo}</span>}
                            </div>
                        </div>

                        {/* Section Informations Agence */}
                        <div className={styles['agency-form__section']}>
                            <h2 className={styles['agency-form__section-title']}>
                                <Building2 size={20} style={{ marginRight: '8px' }} />
                                Informations de l'agence
                            </h2>

                            <div className={styles['agency-form__row']}>
                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Nom de l'agence
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        className={`${styles['agency-form__input']} ${errors.nom ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder="Ex: Transport Express"
                                    />
                                    {errors.nom && <span className={styles['agency-form__error']}>{errors.nom}</span>}
                                </div>

                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        className={`${styles['agency-form__input']} ${errors.telephone ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        placeholder="+235 66 00 00 00"
                                    />
                                    {errors.telephone && <span className={styles['agency-form__error']}>{errors.telephone}</span>}
                                </div>
                            </div>

                            <div className={styles['agency-form__row']}>
                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Adresse
                                    </label>
                                    <input
                                        type="text"
                                        name="adresse"
                                        className={`${styles['agency-form__input']} ${errors.adresse ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.adresse}
                                        onChange={handleChange}
                                        placeholder="Avenue Charles de Gaulle, N'Djamena"
                                    />
                                    {errors.adresse && <span className={styles['agency-form__error']}>{errors.adresse}</span>}
                                </div>

                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Email de l'agence
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`${styles['agency-form__input']} ${errors.email ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@agence.td"
                                    />
                                    {errors.email && <span className={styles['agency-form__error']}>{errors.email}</span>}
                                </div>
                            </div>

                            <div className={styles['agency-form__row']}>
                                <div className={styles['agency-form__field']}>
                                    <label className={styles['agency-form__label']}>
                                        Taux de commission (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="taux_commission"
                                        className={styles['agency-form__input']}
                                        value={formData.taux_commission}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                    />
                                    <span className={styles['agency-form__hint']}>
                                        Commission prélevée sur chaque réservation
                                    </span>
                                </div>
                            </div>

                            <div className={styles['agency-form__row']} style={{ gridTemplateColumns: '1fr' }}>
                                <div className={styles['agency-form__field']}>
                                    <label className={styles['agency-form__label']}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        className={styles['agency-form__textarea']}
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Description de l'agence (optionnel)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Responsable */}
                        <div className={styles['agency-form__section']}>
                            <h2 className={styles['agency-form__section-title']}>
                                <User size={20} style={{ marginRight: '8px' }} />
                                Administrateur de l'agence
                            </h2>

                            <div className={styles['agency-form__row']}>
                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        name="responsable_prenom"
                                        className={`${styles['agency-form__input']} ${errors.responsable_prenom ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.responsable_prenom}
                                        onChange={handleChange}
                                        placeholder="Prénom du responsable"
                                    />
                                    {errors.responsable_prenom && <span className={styles['agency-form__error']}>{errors.responsable_prenom}</span>}
                                </div>

                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="responsable_nom"
                                        className={`${styles['agency-form__input']} ${errors.responsable_nom ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.responsable_nom}
                                        onChange={handleChange}
                                        placeholder="Nom du responsable"
                                    />
                                    {errors.responsable_nom && <span className={styles['agency-form__error']}>{errors.responsable_nom}</span>}
                                </div>
                            </div>

                            <div className={styles['agency-form__row']}>
                                <div className={styles['agency-form__field']}>
                                    <label className={styles['agency-form__label']}>
                                        Téléphone du responsable
                                    </label>
                                    <input
                                        type="tel"
                                        name="responsable_telephone"
                                        className={styles['agency-form__input']}
                                        value={formData.responsable_telephone}
                                        onChange={handleChange}
                                        placeholder="+235 66 00 00 00"
                                    />
                                </div>

                                <div className={styles['agency-form__field']}>
                                    <label className={`${styles['agency-form__label']} ${styles['agency-form__label--required']}`}>
                                        Email du responsable
                                    </label>
                                    <input
                                        type="email"
                                        name="responsable_email"
                                        className={`${styles['agency-form__input']} ${errors.responsable_email ? styles['agency-form__input--error'] : ''}`}
                                        value={formData.responsable_email}
                                        onChange={handleChange}
                                        placeholder="admin@agence.td"
                                    />
                                    {errors.responsable_email && <span className={styles['agency-form__error']}>{errors.responsable_email}</span>}
                                </div>
                            </div>

                            {/* Info Invitation */}
                            <div className={styles['agency-form__invitation']}>
                                <div className={styles['agency-form__invitation-title']}>
                                    <Mail size={18} />
                                    Invitation par email
                                </div>
                                <p className={styles['agency-form__invitation-text']}>
                                    Un email d'invitation sera envoyé à l'adresse du responsable avec un lien de connexion sécurisé.
                                    <br />
                                    <strong>Lors de la première connexion</strong>, le responsable devra obligatoirement définir son propre mot de passe.
                                </p>
                            </div>
                        </div>

                        {/* Error global */}
                        {errors.submit && (
                            <div style={{ color: 'var(--danger-500)', marginBottom: '16px', textAlign: 'center' }}>
                                {errors.submit}
                            </div>
                        )}

                        {/* Actions */}
                        <div className={styles['agency-form__actions']}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/agencies')}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                icon={isEditMode ? CheckCircle : Send}
                                loading={loading}
                            >
                                {isEditMode ? 'Enregistrer les modifications' : 'Créer et envoyer l\'invitation'}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </form>
        </div>
    );
}

export default AgencyForm;
