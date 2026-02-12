import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Edit2, Trash2, Shield, Calendar, Mail,
    Phone, X, CheckSquare, Briefcase, Clock, ChevronRight
} from 'lucide-react';
import {
    getUsers, createUser,
    updateUser, deleteUser,
    getTypesSousAdmin
} from '../../api/users.api';
import { formatDate } from '../../utils/formatters';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './SubAdmins.module.css';

const SubAdminsList = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [typesSousAdmin, setTypesSousAdmin] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });

    // Form states
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        types_sous_admin: [] // Array of type IDs
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Un sous-admin a le role_id = 2
            const response = await getUsers({ role_id: 2 });
            setSubAdmins(response.data);
            setTypesSousAdmin(getTypesSousAdmin());
        } catch (error) {
            console.error('Erreur chargement sous-admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            types_sous_admin: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            types_sous_admin: user.types_sous_admin?.map(t => t.id) || []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await deleteUser(deleteModal.userId);
            setDeleteModal({ open: false, userId: null, userName: '' });
            await loadData();
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleTypeChange = (typeId) => {
        setFormData(prev => {
            if (prev.types_sous_admin.includes(typeId)) {
                return {
                    ...prev,
                    types_sous_admin: prev.types_sous_admin.filter(id => id !== typeId)
                };
            } else {
                return {
                    ...prev,
                    types_sous_admin: [...prev.types_sous_admin, typeId]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reconstruire l'objet complet pour les types
        const selectedTypes = formData.types_sous_admin.map(id => {
            const type = typesSousAdmin.find(t => t.id === id);
            return { id: type.id, code: type.code };
        });

        const payload = {
            ...formData,
            role_id: 2, // Sous-Admin
            types_sous_admin: selectedTypes
        };

        try {
            if (editingUser) {
                await updateUser(editingUser.id, payload);
            } else {
                await createUser(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    return (
        <div className={styles.enterprise_container}>
            <header className={styles.subadmins_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Gestion des Sous-Admin</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Staff & Encadrement</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_primary_pro} onClick={handleCreate}>
                        <Plus size={16} />
                        <span>Nouveau Sous-Admin</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center p-24 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Chargement des protocoles d'accès...
                </div>
            ) : subAdmins.length === 0 ? (
                <div className={styles.empty_state_container_pro}>
                    <div className={styles.empty_state_icon_pro}>
                        <Users size={40} />
                    </div>
                    <h3>Aucun staff détecté</h3>
                    <p>Votre équipe d'administration est vide. Commencez par inviter vos collaborateurs.</p>
                </div>
            ) : (
                <div className={styles.subadmins_grid_pro}>
                    {subAdmins.map(admin => (
                        <div key={admin.id} className={styles.admin_card_pro}>
                            <div className={styles.card_header_pro}>
                                <div className={styles.card_avatar_pro}>
                                    {admin.prenom[0]}{admin.nom[0]}
                                </div>
                                <div className={styles.card_meta_pro}>
                                    <span className={styles.role_label_pro}>Sous-Admin</span>
                                    <h3>{admin.prenom} {admin.nom}</h3>
                                </div>
                                <div className={styles.action_buttons_pro}>
                                    <button
                                        className={styles.action_btn_pro}
                                        onClick={() => handleEdit(admin)}
                                        title="Modifier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.action_btn_pro} ${styles.delete}`}
                                        onClick={() => setDeleteModal({ open: true, userId: admin.id, userName: `${admin.prenom} ${admin.nom}` })}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.card_body_pro}>
                                <div className={styles.contact_row_pro}>
                                    <Mail size={14} />
                                    <span>{admin.email}</span>
                                </div>
                                {admin.telephone && (
                                    <div className={styles.contact_row_pro}>
                                        <Phone size={14} />
                                        <span>{admin.telephone}</span>
                                    </div>
                                )}

                                <div className={styles.responsibility_section_pro}>
                                    <div className={styles.section_title_pro}>
                                        <Shield size={12} />
                                        Responsabilités
                                    </div>
                                    <div className={styles.responsibility_tags_pro}>
                                        {admin.types_sous_admin && admin.types_sous_admin.length > 0 ? (
                                            admin.types_sous_admin.map(type => (
                                                <span
                                                    key={type.id}
                                                    className={`${styles.resp_tag_pro} ${styles[`resp_${type.code}`]}`}
                                                >
                                                    {type.libelle || type.code}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Aucune responsabilité</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.card_footer_pro}>
                                <div className={styles.timestamp_pro}>
                                    <Clock size={12} className="inline mr-1" />
                                    {formatDate(admin.created_at)}
                                </div>
                                <div className={styles.status_pill_success}>
                                    {admin.statut === 'actif' ? 'Actif' : 'Suspendu'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Création/Modification */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setIsModalOpen(false);
                }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingUser ? 'Modifier Sous-Admin' : 'Nouveau Sous-Admin'}
                            </h2>
                            <button className={styles.btnClose} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Prénom</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.prenom}
                                            onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                                            required
                                            placeholder="Ex: Jean"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nom</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.nom}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                            required
                                            placeholder="Ex: Dupont"
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Email professionnel</label>
                                        <div className={styles.inputWrapper}>
                                            <Mail size={18} className={styles.inputIcon} />
                                            <input
                                                type="email"
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                                placeholder="jean.dupont@business.com"
                                            />
                                        </div>
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Téléphone</label>
                                        <div className={styles.inputWrapper}>
                                            <Phone size={18} className={styles.inputIcon} />
                                            <input
                                                type="tel"
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                                value={formData.telephone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                                                placeholder="+235 XX XX XX XX"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Responsabilités & Accès</label>
                                    <p className="text-xs text-gray-500 mb-2">Sélectionnez les modules auxquels ce sous-admin aura accès.</p>
                                    <div className={styles.checkboxGroup}>
                                        {typesSousAdmin.map(type => (
                                            <label key={type.id} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.types_sous_admin.includes(type.id)}
                                                    onChange={() => handleTypeChange(type.id)}
                                                />
                                                <Briefcase size={16} className={
                                                    formData.types_sous_admin.includes(type.id) ? 'text-primary-600' : 'text-gray-400'
                                                } />
                                                <span>{type.libelle}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSave}
                                >
                                    {editingUser ? 'Enregistrer les modifications' : 'Créer le compte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubAdminsList;
