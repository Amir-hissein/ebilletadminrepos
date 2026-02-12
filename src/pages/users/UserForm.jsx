import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, RotateCcw,
    User as UserIcon, Mail, Phone,
    Shield, Building2, Eye, EyeOff,
    Lock, CheckCircle, Info, Fingerprint,
    Contact
} from 'lucide-react';
import { getUserById, createUser, updateUser, getRoles, getTypesSousAdmin } from '../../api/users.api';
import { getAgencies } from '../../api/agencies.api';
import { ROLES } from '../../utils/constants';
import Button from '../../components/common/Button';
import styles from './UserDetail.module.css';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [agencies, setAgencies] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role_id: '',
        agence_id: '',
        mot_de_passe: '',
        statut: 'actif',
        types_sous_admin: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const agenciesResult = await getAgencies();
                setAgencies(agenciesResult.data || []);

                if (isEdit) {
                    const user = await getUserById(id);
                    setFormData({
                        nom: user.nom || '',
                        prenom: user.prenom || '',
                        email: user.email || '',
                        telephone: user.telephone || '',
                        role_id: user.role_id ? user.role_id.toString() : '',
                        agence_id: user.agence_id ? user.agence_id.toString() : '',
                        statut: user.statut || 'actif',
                        types_sous_admin: user.types_sous_admin || []
                    });
                }
            } catch (err) {
                console.error('Erreur initialisation formulaire:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setFormData(prev => ({
            ...prev,
            role_id: roleId,
            agence_id: (roleId === ROLES.ADMIN_AGENCE.toString() || roleId === ROLES.AGENT_AGENCE.toString())
                ? prev.agence_id
                : ''
        }));
    };

    const handleTypeSousAdminChange = (type) => {
        setFormData(prev => {
            const current = prev.types_sous_admin || [];
            const updated = current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type];
            return { ...prev, types_sous_admin: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                role_id: parseInt(formData.role_id),
                agence_id: formData.agence_id ? parseInt(formData.agence_id) : null
            };

            if (isEdit) {
                await updateUser(id, payload);
            } else {
                await createUser(payload);
            }
            navigate('/users');
        } catch (err) {
            console.error('Erreur sauvegarde utilisateur:', err);
            alert('Une erreur est survenue lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Chargement du formulaire...</div>;

    const roles = getRoles();
    const subAdminTypes = getTypesSousAdmin();

    return (
        <div className={`fade-in ${styles.container}`}>
            {/* Immersive Header */}
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> <span>Retour</span>
                    </button>
                    <h1 className={styles.title}>
                        <UserIcon size={28} />
                        {isEdit ? 'Modifier le Profil' : 'Nouvel Utilisateur'}
                    </h1>
                </div>
                <div className={styles.actions}>
                    {isEdit && (
                        <div className={styles.badge_id}>
                            ID UTILISATEUR: {id}
                        </div>
                    )}
                </div>
            </header>

            <form id="user-form" onSubmit={handleSubmit} className={styles.form}>

                {/* Section 1: Identity & Profile */}
                <div className={styles.card}>
                    <div className={styles.card_header_group}>
                        <div className={styles.icon_box_primary}><Fingerprint size={20} /></div>
                        <h2 className="text-lg font-black text-gray-800">Identité & Profil</h2>
                    </div>
                    <p className={styles.section_hint}>Renseignez les informations de base permettant d'identifier l'utilisateur sur la plateforme.</p>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Prénom de l'utilisateur</label>
                            <input
                                type="text"
                                name="prenom"
                                className={styles.input}
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Jean-Luc"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nom de famille</label>
                            <input
                                type="text"
                                name="nom"
                                className={styles.input}
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                placeholder="Ex: NDJAMENA"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className={styles.card}>
                    <div className={styles.card_header_group}>
                        <div className={styles.icon_box_primary}><Contact size={20} /></div>
                        <h2 className="text-lg font-black text-gray-800">Coordonnées de Contact</h2>
                    </div>
                    <p className={styles.section_hint}>Ces informations seront utilisées pour les notifications système et la récupération de compte.</p>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Adresse Email Professionnelle</label>
                            <div className={styles.input_relative}>
                                <Mail size={18} className={styles.input_icon} />
                                <input
                                    type="email"
                                    name="email"
                                    className={`${styles.input} ${styles.input_with_icon}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="nom.prenom@ebillet.td"
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Numéro de Téléphone</label>
                            <div className={styles.input_relative}>
                                <Phone size={18} className={styles.input_icon} />
                                <input
                                    type="tel"
                                    name="telephone"
                                    className={`${styles.input} ${styles.input_with_icon}`}
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+235 60 00 00 00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: System Roles & Permissions */}
                <div className={styles.card}>
                    <div className={styles.card_header_group}>
                        <div className={styles.icon_box_orange}><Shield size={20} /></div>
                        <h2 className="text-lg font-black text-gray-800">Rôles & Habilitations</h2>
                    </div>
                    <p className={styles.section_hint}>Définissez le périmètre d'action de l'utilisateur et son affiliation à une agence si nécessaire.</p>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Rôle Système</label>
                            <select
                                className={styles.select}
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleRoleChange}
                                required
                            >
                                <option value="">Attribuer un rôle...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.nom}</option>
                                ))}
                            </select>
                        </div>

                        {(formData.role_id === '3' || formData.role_id === '4') && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Agence Affiliée</label>
                                <div className={styles.input_relative}>
                                    <Building2 size={18} className={styles.input_icon} />
                                    <select
                                        className={`${styles.select} ${styles.input_with_icon}`}
                                        name="agence_id"
                                        value={formData.agence_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Sélectionner une agence</option>
                                        {agencies.map(agency => (
                                            <option key={agency.id} value={agency.id}>{agency.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {formData.role_id === '2' && (
                        <div className={styles.sub_admin_section}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'block' }}>
                                <Info size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Domaines de Gestion Sous-Admin
                            </label>
                            <div className={styles.sub_admin_grid}>
                                {subAdminTypes.map(type => (
                                    <label key={type} className={styles.checkbox_card}>
                                        <input
                                            type="checkbox"
                                            checked={formData.types_sous_admin.includes(type)}
                                            onChange={() => handleTypeSousAdminChange(type)}
                                            className={styles.checkbox_input}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 4: Security (New Only) */}
                {!isEdit && (
                    <div className={styles.card}>
                        <div className={styles.card_header_group}>
                            <div className={styles.icon_box_emerald}><Lock size={20} /></div>
                            <h2 className="text-lg font-black text-gray-800">Sécurité du Compte</h2>
                        </div>
                        <p className={styles.section_hint}>Définissez un mot de passe temporaire que l'utilisateur devra changer à sa première connexion.</p>

                        <div className={styles.formGroup} style={{ maxWidth: '400px' }}>
                            <label className={styles.label}>Mot de passe Provisoire</label>
                            <div className={styles.input_relative}>
                                <Lock size={18} className={styles.input_icon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="mot_de_passe"
                                    className={`${styles.input} ${styles.input_with_icon} ${styles.input_with_icon_right}`}
                                    value={formData.mot_de_passe}
                                    onChange={handleChange}
                                    required
                                    placeholder="8 caractères minimum"
                                />
                                <button
                                    type="button"
                                    className={styles.password_toggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Actions */}
                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.btnReset}
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Annuler les modifications
                    </button>
                    <button
                        type="submit"
                        className={styles.btnSave}
                        disabled={saving}
                    >
                        {saving ? 'Synchronisation...' : <><Save size={20} /> {isEdit ? 'Mettre à jour le Profil' : 'Enregistrer le Profil'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
