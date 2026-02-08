import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { getComplaints, getComplaintsStats } from '../../api/complaints.api';
import { formatDate } from '../../utils/formatters';
import styles from './Support.module.css';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, ouvertes: 0, en_traitement: 0, resolues: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        statut: '',
        priorite: '',
        type: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [complaintsData, statsData] = await Promise.all([
                getComplaints(filters),
                getComplaintsStats()
            ]);
            setComplaints(complaintsData.data);
            setStats(statsData);
        } catch (error) {
            console.error('Erreur chargement plaintes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ouverte': return 'Ouverte';
            case 'en_traitement': return 'En cours';
            case 'resolue': return 'Résolue';
            default: return status;
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'haute': return 'Haute';
            case 'moyenne': return 'Moyenne';
            case 'basse': return 'Basse';
            default: return priority;
        }
    };

    return (
        <div className="fade-in">
            <div className="mb-8">
                <h1 className="page-title">Support & Réclamations</h1>
                <p className="page-subtitle">Gestion des plaintes clients et litiges agences</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.redGradient}`}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.statIconWrapper} ${styles.red}`}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <span className={styles.statLabel}>Plaintes Ouvertes</span>
                            <div className={styles.statValue}>{stats.ouvertes}</div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.orangeGradient}`}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.statIconWrapper} ${styles.orange}`}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <span className={styles.statLabel}>En Traitement</span>
                            <div className={styles.statValue}>{stats.en_traitement}</div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.greenGradient}`}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.statIconWrapper} ${styles.green}`}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <span className={styles.statLabel}>Résolues</span>
                            <div className={styles.statValue}>{stats.resolues}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.filterBar}>
                <div className="flex items-center gap-2 text-gray-500 mr-4">
                    <Filter size={20} />
                    <span className="font-medium text-sm">Filtres:</span>
                </div>

                <select
                    className={styles.filterSelect}
                    value={filters.statut}
                    onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                >
                    <option value="">Tous les statuts</option>
                    <option value="ouverte">Ouverte</option>
                    <option value="en_traitement">En traitement</option>
                    <option value="resolue">Résolue</option>
                </select>

                <select
                    className={styles.filterSelect}
                    value={filters.priorite}
                    onChange={(e) => setFilters(prev => ({ ...prev, priorite: e.target.value }))}
                >
                    <option value="">Toutes les priorités</option>
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                </select>

                <select
                    className={styles.filterSelect}
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                    <option value="">Tous les types</option>
                    <option value="service">Service</option>
                    <option value="retard">Retard</option>
                    <option value="annulation">Annulation</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className="table w-full">
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>Date</th>
                            <th className={styles.tableHeaderCell}>Client</th>
                            <th className={styles.tableHeaderCell}>Sujet</th>
                            <th className={styles.tableHeaderCell}>Priorité</th>
                            <th className={styles.tableHeaderCell}>Statut</th>
                            <th className={styles.tableHeaderCell} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center p-8 text-gray-500">Chargement...</td>
                            </tr>
                        ) : complaints.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-8 text-gray-500">Aucune plainte trouvée</td>
                            </tr>
                        ) : complaints.map(complaint => (
                            <tr key={complaint.id} className={styles.tableRow}>
                                <td className={styles.tableCell}>
                                    {formatDate(complaint.created_at)}
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={styles.clientInfo}>
                                        {complaint.client ? `${complaint.client.nom} ${complaint.client.prenom}` : 'Anonyme'}
                                    </span>
                                    <span className={styles.clientSub}>
                                        {complaint.agence ? complaint.agence.nom : '—'}
                                    </span>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className="flex flex-col">
                                        <span className={styles.complaintType}>
                                            {complaint.type_plainte}
                                        </span>
                                        <span className={styles.complaintDesc} title={complaint.description}>
                                            {complaint.description}
                                        </span>
                                    </div>
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={`${styles.priorityBadge} ${complaint.priorite === 'haute' ? styles.priorityHigh :
                                            complaint.priorite === 'moyenne' ? styles.priorityMedium : styles.priorityLow
                                        }`}>
                                        {complaint.priorite === 'haute' && <AlertTriangle size={12} />}
                                        {getPriorityLabel(complaint.priorite)}
                                    </span>
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={`${styles.statusBadge} ${complaint.statut === 'ouverte' ? styles.statusOpen :
                                            complaint.statut === 'en_traitement' ? styles.statusProcessing : styles.statusResolved
                                        }`}>
                                        {getStatusLabel(complaint.statut)}
                                    </span>
                                </td>
                                <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                                    <button
                                        className={styles.btnAction}
                                        onClick={() => window.location.href = `/support/${complaint.id}`}
                                    >
                                        Gérer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComplaintsList;
