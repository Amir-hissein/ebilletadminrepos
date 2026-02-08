import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Edit2, Trash2, Shield, Calendar, Mail,
    Phone, X, CheckSquare, Briefcase, Clock
} from 'lucide-react';
import {
    getUsers, createUser,
    updateUser, deleteUser,
    getTypesSousAdmin
} from '../../api/users.api';
import { formatDate } from '../../utils/formatters';
import styles from './SubAdmins.module.css';

const SubAdminsList = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [typesSousAdmin, setTypesSousAdmin] = useState([]);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-administrateur ?')) return;
        try {
            await deleteUser(id);
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
        <div className={`fade-in ${styles.container}`}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestion des Sous-Admins</h1>
                    <p className={styles.subtitle}>Gérez les comptes staff et leurs responsabilités</p>
                </div>
                <button className={styles.createButton} onClick={handleCreate}>
                    <Plus size={20} />
                    Nouveau Sous-Admin
                </button>
            </div>

            {loading ? (
                <div className="text-center p-12 text-gray-500">Chargement...</div>
            ) : subAdmins.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>Aucun sous-administrateur trouvé. Créez-en un pour commencer.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {subAdmins.map(admin => (
                        <div key={admin.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {admin.prenom[0]}{admin.nom[0]}
                                    </div>
                                    <div className={styles.userDetails}>
                                        <h3>{admin.prenom} {admin.nom}</h3>
                                        <span className={styles.userRole}>Sous-Admin</span>
                                        <div className={styles.userEmail}>{admin.email}</div>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.btnIcon}
                                        onClick={() => handleEdit(admin)}
                                        title="Modifier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.btnIcon} ${styles.delete}`}
                                        onClick={() => handleDelete(admin.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <span className={styles.sectionLabel}>Responsabilités</span>
                                <div className={styles.responsibilityList}>
                                    {admin.types_sous_admin && admin.types_sous_admin.length > 0 ? (
                                        admin.types_sous_admin.map(type => (
                                            <span
                                                key={type.id}
                                                className={`${styles.responsibilityBadge} ${styles[`resp_${type.code}`]}`}
                                            >
                                                {type.libelle || type.code}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Aucune responsabilité assignée</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.footerInfo}>
                                    <Clock size={12} className="inline mr-1" />
                                    Ajouté le {formatDate(admin.created_at)}
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${admin.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
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
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Email professionnel</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                className={`${styles.input} pl-10 w-full`}
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Téléphone</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                className={`${styles.input} pl-10 w-full`}
                                                value={formData.telephone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                                                placeholder="+235"
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
                                                <Briefcase size={14} className={
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
                                    {editingUser ? 'Enregistrer' : 'Créer le compte'}
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
