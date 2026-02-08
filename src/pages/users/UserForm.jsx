import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, RotateCcw,
    User as UserIcon, Mail, Phone,
    Shield, Building2, Eye, EyeOff
} from 'lucide-react';
import { getUserById, createUser, updateUser, getRoles, getTypesSousAdmin } from '../../api/users.api';
import { getAgencies } from '../../api/agencies.api';
import { ROLES } from '../../utils/constants';
import Button from '../../components/common/Button';
import styles from './UserDetail.module.css'; // On réutilise les styles

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
                setAgencies(agenciesResult.data);

                if (isEdit) {
                    const user = await getUserById(id);
                    setFormData({
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        telephone: user.telephone,
                        role_id: user.role_id.toString(),
                        agence_id: user.agence_id ? user.agence_id.toString() : '',
                        statut: user.statut,
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
            // Reset agence if not needed for this role
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
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </button>
                    <h1 className={styles.title}>
                        {isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                    </h1>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}><UserIcon size={18} /> Informations Personnelles</h2>
                </div>
                <div className={styles.cardBody}>
                    <form id="user-form" className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Prénom</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    className={styles.input}
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                    placeholder="Prénom de l'utilisateur"
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
                                    placeholder="Nom de famille"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email professionnel</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        className={`${styles.input} pl-10`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="email@example.td"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Téléphone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="telephone"
                                        className={`${styles.input} pl-10`}
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+235 6X XX XX XX"
                                    />
                                </div>
                            </div>
                        </div>

                        {!isEdit && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mot de passe provisoire</label>
                                <div className="relative">
                                    <Shield size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="mot_de_passe"
                                        className={`${styles.input} pl-10 pr-10`}
                                        value={formData.mot_de_passe}
                                        onChange={handleChange}
                                        required
                                        placeholder="Min 8 caractères"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-6 mt-2">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <Shield size={16} className="text-primary-500" /> Attribution du Rôle
                            </h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Rôle de l'utilisateur</label>
                                    <select
                                        className={styles.select}
                                        name="role_id"
                                        value={formData.role_id}
                                        onChange={handleRoleChange}
                                        required
                                    >
                                        <option value="">Sélectionner un rôle</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.nom}</option>
                                        ))}
                                    </select>
                                </div>

                                {(formData.role_id === '3' || formData.role_id === '4') && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Affectation Agence</label>
                                        <select
                                            className={styles.select}
                                            name="agence_id"
                                            value={formData.agence_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Sélectionner l'agence</option>
                                            {agencies.map(agency => (
                                                <option key={agency.id} value={agency.id}>{agency.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {formData.role_id === '2' && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <label className={styles.label + " mb-3 block"}>Responsabilités Sous-Admin</label>
                                    <div className="flex flex-wrap gap-3">
                                        {subAdminTypes.map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-200 hover:border-primary-300">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.types_sous_admin.includes(type)}
                                                    onChange={() => handleTypeSousAdminChange(type)}
                                                    className="w-4 h-4 text-primary-600 rounded"
                                                />
                                                <span className="text-sm font-medium capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">Un sous-admin peut avoir plusieurs domaines de responsabilité.</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.formActions}>
                <button
                    className={styles.btnReset}
                    onClick={() => navigate(-1)}
                    disabled={saving}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    form="user-form"
                    className={styles.btnSave}
                    disabled={saving}
                >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Enregistrement...' : 'Enregistrer l\'utilisateur'}
                </button>
            </div>
        </div>
    );
};

export default UserForm;
