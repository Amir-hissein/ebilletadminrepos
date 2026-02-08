import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, MapPin, Calendar, CreditCard,
    AlertTriangle, CheckCircle, Clock, MessageSquare
} from 'lucide-react';
import { getComplaintById, updateComplaint } from '../../api/complaints.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import styles from './Support.module.css';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolution, setResolution] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getComplaintById(id);
            setComplaint(result);
            if (result.resolution) setResolution(result.resolution);
        } catch (error) {
            console.error('Erreur chargement plainte:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolution.trim()) return;

        setSaving(true);
        try {
            await updateComplaint(id, {
                resolution: resolution,
                statut: 'resolue',
                date_resolution: new Date().toISOString()
            });
            // Recharger pour voir les mises à jour
            await loadData();
        } catch (error) {
            console.error('Erreur résolution:', error);
            alert('Erreur lors de la résolution');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (!complaint) return <div className="p-8 text-center text-red-500">Plainte introuvable</div>;

    return (
        <div className="fade-in max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/support')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                title="Retour à la liste"
            >
                <ArrowLeft size={20} />
                Retour aux plaintes
            </button>

            <div className={styles.detailHeader}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">#{complaint.id}</span>
                        <Badge variant={
                            complaint.statut === 'ouverte' ? 'danger' :
                                complaint.statut === 'en_traitement' ? 'warning' : 'success'
                        }>
                            {complaint.statut === 'ouverte' ? 'Ouverte' :
                                complaint.statut === 'en_traitement' ? 'En Traitement' : 'Résolue'}
                        </Badge>
                        <Badge variant={
                            complaint.priorite === 'haute' ? 'danger' :
                                complaint.priorite === 'moyenne' ? 'warning' : 'info'
                        }>
                            Priorité {complaint.priorite}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {complaint.type_plainte.charAt(0).toUpperCase() + complaint.type_plainte.slice(1)}
                    </h1>
                    <p className="text-gray-500">
                        Ouverte le {formatDate(complaint.created_at)}
                    </p>
                </div>
            </div>

            <div className={styles.detailGrid}>
                {/* Colonne Principale */}
                <div>
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionTitle}>
                            <MessageSquare size={20} />
                            Description du problème
                        </h2>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                            "{complaint.description}"
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionTitle}>
                            <CheckCircle size={20} />
                            Résolution
                        </h2>
                        {complaint.statut === 'resolue' ? (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-green-800 mb-2 font-medium">Résolue le {formatDate(complaint.date_resolution)}</p>
                                <p className="text-gray-700">{complaint.resolution}</p>
                            </div>
                        ) : (
                            <div className={styles.resolutionBox}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note de résolution
                                </label>
                                <textarea
                                    className={styles.resolutionTextarea}
                                    placeholder="Décrivez les actions prises et la solution..."
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleResolve}
                                        disabled={saving || !resolution.trim()}
                                    >
                                        {saving ? 'Enregistrement...' : 'Marquer comme résolue'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonne Latérale */}
                <div className="flex flex-col gap-6">
                    {/* Info Client */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionTitle}>
                            <User size={20} />
                            Client
                        </h2>
                        {complaint.client ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {complaint.client.nom[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{complaint.client.nom} {complaint.client.prenom}</div>
                                        <div className="text-xs text-gray-500">{complaint.client.email}</div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-1 space-y-2">
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Téléphone</span>
                                        <span className={styles.infoValue}>{complaint.client.telephone}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Client introuvable</p>
                        )}
                    </div>

                    {/* Info Réservation */}
                    {complaint.reservation && (
                        <div className={styles.infoCard}>
                            <h2 className={styles.sectionTitle}>
                                <CreditCard size={20} />
                                Réservation Associée
                            </h2>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Code Réservation</div>
                                    <div className="font-mono font-bold text-primary-600">
                                        {complaint.reservation.numero_reservation}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Voyage</span>
                                    <span className={styles.infoValue}>
                                        {complaint.reservation.voyage?.ville_depart_nom} → {complaint.reservation.voyage?.ville_arrivee_nom}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Date</span>
                                    <span className={styles.infoValue}>
                                        {formatDate(complaint.reservation.voyage?.date_depart)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Montant</span>
                                    <span className={styles.infoValue}>
                                        {formatCurrency(complaint.reservation.prix_total)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Agence</span>
                                    <span className={styles.infoValue}>
                                        {complaint.agence?.nom}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
