import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { getAgencies, updateAgency } from '../../api/agencies.api';
import { formatPercent } from '../../utils/formatters';
import styles from './Finance.module.css';

const Commissions = () => {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getAgencies({ limit: 100 });
            setAgencies(result.data);
        } catch (error) {
            console.error('Erreur chargement agences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (agency) => {
        setEditingId(agency.id);
        setEditValue(agency.commission_pourcentage);
    };

    const handleSave = async (id) => {
        if (isNaN(parseFloat(editValue)) || parseFloat(editValue) < 0 || parseFloat(editValue) > 100) {
            alert("Veuillez entrer un pourcentage valide entre 0 et 100.");
            return;
        }

        setSaving(true);
        try {
            await updateAgency(id, { commission_pourcentage: parseFloat(editValue) });

            // Mettre à jour la liste locale
            setAgencies(prev => prev.map(a =>
                a.id === id ? { ...a, commission_pourcentage: parseFloat(editValue) } : a
            ));

            setEditingId(null);
        } catch (error) {
            console.error('Erreur sauvegarde commission:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    return (
        <div className="fade-in">
            <div className={styles.transactionsHeader}>
                <div>
                    <h1 className="page-title">Gestion des Commissions</h1>
                    <p className="page-subtitle">Configurez le pourcentage perçu sur chaque réservation par agence</p>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                <div className={`${styles.statCard} ${styles.blueGradient}`}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.statIconWrapper} ${styles.blue}`}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <span className={styles.statLabel}>Taux Moyen</span>
                            <div className={styles.statValue}>
                                {agencies.length ? formatPercent(agencies.reduce((acc, a) => acc + a.commission_pourcentage, 0) / agencies.length, 1) : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.greenGradient}`}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.statIconWrapper} ${styles.green}`}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <span className={styles.statLabel}>Agences Actives</span>
                            <div className={styles.statValue}>
                                {agencies.filter(a => a.statut === 'active').length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className="table w-full">
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>Agence</th>
                            <th className={styles.tableHeaderCell}>Ville</th>
                            <th className={styles.tableHeaderCell}>Type</th>
                            <th className={styles.tableHeaderCell} style={{ textAlign: 'center' }}>Taux de Commission</th>
                            <th className={styles.tableHeaderCell} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Chargement des données...
                                </td>
                            </tr>
                        ) : agencies.map(agency => (
                            <tr key={agency.id} className={styles.tableRow}>
                                <td className={styles.tableCell}>
                                    <span className={styles.agencyName}>{agency.nom}</span>
                                    <span className={styles.agencyEmail}>{agency.email}</span>
                                </td>
                                <td className={styles.tableCell}>{agency.ville}</td>
                                <td className={styles.tableCell}>
                                    <span className={`${styles.serviceBadge} ${agency.type_service === 'bus' ? styles.serviceBadgeBus : styles.serviceBadgePlane
                                        }`}>
                                        {agency.type_service === 'bus' ? 'Transport Bus' : 'Compagnie Aérienne'}
                                    </span>
                                </td>
                                <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {editingId === agency.id ? (
                                            <div className={styles.editContainer}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={styles.editInput}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSave(agency.id);
                                                        if (e.key === 'Escape') handleCancel();
                                                    }}
                                                />
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>%</span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '1.125rem', fontWeight: 700 }} className={
                                                agency.commission_pourcentage >= 15 ? styles.rateHigh :
                                                    agency.commission_pourcentage <= 5 ? styles.rateLow : styles.rateNormal
                                            }>
                                                {formatPercent(agency.commission_pourcentage, 1)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                                    {editingId === agency.id ? (
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.btnSave}
                                                onClick={() => handleSave(agency.id)}
                                                disabled={saving}
                                                title="Sauvegarder"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                className={styles.btnCancel}
                                                onClick={handleCancel}
                                                disabled={saving}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(agency)}
                                        >
                                            Modifier
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.commissionNote}>
                <AlertCircle className={styles.commissionNoteIcon} size={24} />
                <div>
                    <span className={styles.commissionNoteTitle}>Information importante sur les taux</span>
                    <p>
                        La modification du taux de commission est immédiate pour toutes les <strong>futures réservations</strong>.
                        Les réservations déjà créées ou en attente conserveront le taux qui était en vigueur au moment de leur création.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Commissions;
