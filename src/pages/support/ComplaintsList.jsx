import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getComplaints, getComplaintsStats } from '../../api/complaints.api';
import { formatDate } from '../../utils/formatters';
import styles from './Support.module.css';

const ComplaintsList = () => {
    const navigate = useNavigate();
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
        <div className={styles.enterprise_container}>
            <header className={styles.complaints_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Support & Réclamations</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Haute Priorité Actives</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
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

                <div className={styles.statCard}>
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

                <div className={styles.statCard}>
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
            </div >

            <div className={styles.complaints_filters_pro}>
                <select
                    className={styles.select_compact}
                    value={filters.statut}
                    onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                >
                    <option value="">Tous les statuts</option>
                    <option value="ouverte">Ouverte</option>
                    <option value="en_traitement">En traitement</option>
                    <option value="resolue">Résolue</option>
                </select>

                <select
                    className={styles.select_compact}
                    value={filters.priorite}
                    onChange={(e) => setFilters(prev => ({ ...prev, priorite: e.target.value }))}
                >
                    <option value="">Toutes les priorités</option>
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                </select>

                <select
                    className={styles.select_compact}
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

            <div className={styles.complaints_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    <table className={styles.complaints_table_pro}>
                        <thead>
                            <tr>
                                <th>Émission</th>
                                <th>Émetteur / Agence</th>
                                <th>Sujet & Description</th>
                                <th>Niveau</th>
                                <th>État</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 opacity-50">Synchronisation du support...</td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className={styles.empty_state_container_pro}>
                                            <div className={styles.empty_state_icon_pro}>
                                                <AlertCircle size={40} />
                                            </div>
                                            <h3>Aucun dossier actif</h3>
                                            <p>Le centre de support est actuellement vide. Félicitations, aucun litige n'est en attente.</p>
                                            <button
                                                className={styles.reset_filters_btn_pro}
                                                onClick={() => setFilters({ statut: '', priorite: '', type: '' })}
                                            >
                                                Actualiser les flux
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : complaints.map(complaint => (
                                <tr key={complaint.id}>
                                    <td>
                                        <span className={styles.mono_text}>
                                            {formatDate(complaint.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.complaint_meta_cell}>
                                            <span className={styles.cell_main_text}>
                                                {complaint.client ? `${complaint.client.nom} ${complaint.client.prenom}` : 'Utilisateur Anonyme'}
                                            </span>
                                            <span className={styles.cell_sub_text}>
                                                {complaint.agence ? complaint.agence.nom : 'Canal Direct'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.complaint_content_cell}>
                                            <span className={styles.complaint_subject}>
                                                {complaint.type_plainte}
                                            </span>
                                            <span className={styles.complaint_preview} title={complaint.description}>
                                                {complaint.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`${styles.priority_indicator} ${styles[`priority_${complaint.priorite}`]}`}>
                                            {complaint.priorite === 'haute' && <AlertTriangle size={14} />}
                                            {getPriorityLabel(complaint.priorite)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles[`status_pill_${complaint.statut === 'en_traitement' ? 'warning' : complaint.statut === 'resolue' ? 'success' : 'danger'}`]}>
                                            {getStatusLabel(complaint.statut)}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className={styles.action_btn_pro}
                                            onClick={() => navigate(`/support/${complaint.id}`)}
                                        >
                                            Gérer le dossier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplaintsList;
