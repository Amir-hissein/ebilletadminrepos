import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, MapPin,
    Bus, Plane, Users, CreditCard,
    ChevronRight, Trash2, Edit,
    Ticket, Building2, TrendingUp, Info
} from 'lucide-react';
import { getVoyageById, deleteVoyage } from '../../api/voyages.api';
import { getReservations } from '../../api/reservations.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { TRANSPORT_TYPES_LABELS, TRIP_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './VoyageDetail.module.css';

const VoyageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voyage, setVoyage] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [voyageData, reservationsData] = await Promise.all([
                    getVoyageById(id),
                    getReservations({ voyage_id: id })
                ]);
                setVoyage(voyageData);
                setReservations(reservationsData.data);
            } catch (err) {
                console.error('Erreur chargement détails voyage:', err);
                setError('Impossible de charger les détails du voyage.');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadData();
    }, [id]);

    if (loading) {
        return <div className={styles.loading}>Chargement des détails...</div>;
    }

    if (error || !voyage) {
        return (
            <div className={styles.container}>
                <div className="text-center p-12 bg-white rounded-lg border border-red-100 text-red-600">
                    <p>{error || 'Voyage non trouvé.'}</p>
                    <Button icon={ArrowLeft} variant="outline" className="mt-4" onClick={() => navigate('/voyages')}>
                        Retour à la liste
                    </Button>
                </div>
            </div>
        );
    }

    const fillRatio = (voyage.places_totales - voyage.places_disponibles) / voyage.places_totales;
    const fillPercent = Math.round(fillRatio * 100);

    const getFillVariant = (ratio) => {
        if (ratio >= 0.8) return styles.fill_high;
        if (ratio >= 0.4) return styles.fill_medium;
        return styles.fill_low;
    };

    const getStatusVariant = (statut) => {
        const variants = {
            'planifie': 'primary',
            'en_cours': 'warning',
            'termine': 'success',
            'annule': 'danger'
        };
        return variants[statut] || 'neutral';
    };

    const totalRevenue = reservations.reduce((sum, res) => sum + (res.montant_total || 0), 0);
    const confirmedReservations = reservations.filter(r => r.statut === 'confirmee').length;

    const handleDelete = async () => {
        try {
            await deleteVoyage(id);
            navigate('/voyages');
        } catch (error) {
            console.error('Erreur suppression voyage:', error);
            alert('Impossible de supprimer le voyage.');
        }
    };

    return (
        <div className={`fade-in ${styles.container}`}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <button className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-2" onClick={() => navigate('/voyages')}>
                        <ArrowLeft size={16} className="mr-1" /> Retour aux voyages
                    </button>
                    <h1 className={styles.title}>
                        Voyage #{voyage.id}
                        <Badge variant={getStatusVariant(voyage.statut)}>
                            {TRIP_STATUS_LABELS[voyage.statut]}
                        </Badge>
                    </h1>
                    <p className={styles.subtitle}>
                        Créé le {formatDate(voyage.created_at)}
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button icon={Edit} variant="outline" onClick={() => navigate(`/voyages/${id}/edit`)}>
                        Modifier
                    </Button>
                    <Button
                        icon={Trash2}
                        variant="outline"
                        style={{ color: 'var(--danger-500)', borderColor: 'var(--danger-100)' }}
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer définitivement le voyage #${id} ? Cette action est irréversible.`}
                confirmLabel="Supprimer définitivement"
            />

            <div className={styles.grid}>
                <div className={styles.main}>
                    {/* Info Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}><MapPin size={18} /> Itinéraire & Planning</h2>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.routeInfo}>
                                <div className={styles.location}>
                                    <span className={styles.city}>{voyage.ville_depart_nom}</span>
                                    <span className={styles.time}>{voyage.heure_depart}</span>
                                    <span className={styles.date}>{formatDate(voyage.date_depart)}</span>
                                </div>
                                <div className={styles.routeLine}>
                                    <div className={styles.routeIcon}>
                                        {voyage.type_transport === 'avion' ? <Plane size={24} /> : <Bus size={24} />}
                                    </div>
                                </div>
                                <div className={styles.location}>
                                    <span className={styles.city}>{voyage.ville_arrivee_nom}</span>
                                    <span className={styles.time}>{voyage.heure_arrivee || '--:--'}</span>
                                    <span className={styles.date}>{formatDate(voyage.date_arrivee || voyage.date_depart)}</span>
                                </div>
                            </div>

                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Type de transport</span>
                                    <span className={styles.detailValue}>
                                        {voyage.type_transport === 'avion' ? <Plane size={16} /> : <Bus size={16} />}
                                        {TRANSPORT_TYPES_LABELS[voyage.type_transport]}
                                        {voyage.numero_vol_bus && <span className="text-gray-400 ml-1">({voyage.numero_vol_bus})</span>}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Agence</span>
                                    <span className={styles.detailValue}>
                                        <Building2 size={16} />
                                        {voyage.agence?.nom}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Tarif passager</span>
                                    <span className={styles.detailValue}>
                                        <CreditCard size={16} />
                                        {formatCurrency(voyage.prix_unitaire)}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Places totales</span>
                                    <span className={styles.detailValue}>
                                        <Users size={16} />
                                        {voyage.places_totales} sièges
                                    </span>
                                </div>
                            </div>

                            <div className={styles.capacity}>
                                <div className={styles.capacityHeader}>
                                    <span className={styles.capacityText}>Taux de remplissage</span>
                                    <span className={styles.capacityText}>{fillPercent}% ({voyage.places_totales - voyage.places_disponibles} / {voyage.places_totales})</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={`${styles.progressFill} ${getFillVariant(fillRatio)}`}
                                        style={{ width: `${fillPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservations List */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}><Ticket size={18} /> Passagers & Réservations</h2>
                            <Badge variant="neutral">{reservations.length} total</Badge>
                        </div>
                        <div className={styles.tableContainer}>
                            {reservations.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Info size={32} className="mx-auto mb-2 opacity-20" />
                                    <p>Aucune réservation pour ce voyage</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Passager</th>
                                            <th>Places</th>
                                            <th>Montant</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(res => (
                                            <tr key={res.id}>
                                                <td className="font-mono text-xs">{res.code_reservation}</td>
                                                <td>
                                                    <div className={styles.clientInfo}>
                                                        <div className={styles.avatar}>
                                                            {res.client?.prenom?.[0]}{res.client?.nom?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{res.client?.prenom} {res.client?.nom}</div>
                                                            <div className="text-xs text-gray-500">{res.client?.telephone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{res.nombre_places}</td>
                                                <td className="font-medium">{formatCurrency(res.montant_total)}</td>
                                                <td>
                                                    <Badge variant={res.statut === 'confirmee' ? 'success' : 'warning'} size="sm">
                                                        {res.statut}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <button
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary-600"
                                                        onClick={() => navigate(`/reservations/${res.id}`)}
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    {/* Revenue Stats */}
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Revenu Attendu</span>
                        <span className={styles.statValue}>{formatCurrency(voyage.prix_unitaire * voyage.places_totales)}</span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Revenu Actuel</span>
                        <span className={styles.statValue}>{formatCurrency(totalRevenue)}</span>
                        <div className={`${styles.statTrend} ${styles.trend_up}`}>
                            <TrendingUp size={12} /> {Math.round((totalRevenue / (voyage.prix_unitaire * voyage.places_totales || 1)) * 100)}% du potentiel
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Réservations Confirmées</span>
                        <span className={styles.statValue}>{confirmedReservations}</span>
                        <span className={styles.subtitle}>{reservations.length - confirmedReservations} en attente</span>
                    </div>

                    {/* Quick Info */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Notes & Description</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <p className="text-sm text-gray-600 italic">
                                {voyage.description || "Aucune note particulière pour ce voyage."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoyageDetail;
