import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Printer,
    Share2,
    ArrowLeft,
    Check,
    X,
    AlertTriangle,
    Bus,
    Plane,
    Clock
} from 'lucide-react';
import { getReservationById, cancelReservation } from '../../api/reservations.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS, TRANSPORT_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import styles from './ReservationDetails.module.css';

function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            loadReservation();
        }
    }, [id]);

    const loadReservation = async () => {
        setLoading(true);
        try {
            const result = await getReservationById(id);
            if (result) {
                setReservation(result);
            } else {
                setError("Réservation non trouvée");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement de la réservation");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            try {
                await cancelReservation(id);
                loadReservation(); // Reload to see status change
            } catch (err) {
                alert("Erreur lors de l'annulation");
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-4">Chargement...</div>;
    if (error || !reservation) return <div className="p-4 text-red-500">{error || "Introuvable"}</div>;

    // Status helpers
    const getStatusBadge = (status) => {
        let className = styles.reservationDetail__status;
        if (status === RESERVATION_STATUS.CONFIRMED) {
            className += ` ${styles['reservationDetail__status--confirmed']}`;
        } else if (status === RESERVATION_STATUS.CANCELLED) {
            className += ` ${styles['reservationDetail__status--cancelled']}`;
        } else {
            className += ` ${styles['reservationDetail__status--pending']}`;
        }

        return (
            <div className={className}>
                {status === RESERVATION_STATUS.CONFIRMED ? <Check size={14} /> :
                    status === RESERVATION_STATUS.CANCELLED ? <X size={14} /> :
                        <AlertTriangle size={14} />}
                {RESERVATION_STATUS_LABELS[status] || status}
            </div>
        );
    };

    // QR Code data: Simple JSON for now
    const qrData = JSON.stringify({
        id: reservation.id,
        code: reservation.code_reservation,
        client: `${reservation.client?.prenom} ${reservation.client?.nom}`,
        voyage: reservation.voyage_id,
        status: reservation.statut
    });

    return (
        <div className={styles.reservationDetail}>
            {/* Header */}
            <div className={styles.reservationDetail__header}>
                <div className={styles['reservationDetail__title-group']}>
                    <Link to="/reservations" className={styles['reservationDetail__back-link']}>
                        <ArrowLeft size={16} />
                        Retour aux réservations
                    </Link>
                    <h1 className={styles.reservationDetail__title}>
                        Réservation #{reservation.code_reservation || reservation.numero_reservation}
                    </h1>
                    {getStatusBadge(reservation.statut)}
                </div>
                <div className={styles.reservationDetail__actions}>
                    <Button variant="secondary" onClick={handlePrint} icon={Printer}>
                        Imprimer
                    </Button>
                    {reservation.statut === RESERVATION_STATUS.CONFIRMED && (
                        <Button variant="danger" onClick={handleCancel}>
                            Annuler
                        </Button>
                    )}
                    {reservation.statut === RESERVATION_STATUS.PENDING && (
                        <Button variant="primary" onClick={() => navigate(`/finance/payments/new?reservation=${id}`)}>
                            Encaisser
                        </Button>
                    )}
                </div>
            </div>

            <div className={styles.reservationDetail__grid}>
                {/* Left Column: Info */}
                <div className={styles['reservationDetail__info-list']}>

                    {/* Client Info */}
                    <div className={styles.reservationDetail__card}>
                        <div className={styles['reservationDetail__card-header']}>
                            <div className={styles['reservationDetail__card-icon']}>
                                <User size={18} />
                            </div>
                            <h2 className={styles['reservationDetail__card-title']}>Informations Client</h2>
                        </div>
                        <div className={styles['reservationDetail__card-content']}>
                            <div className={styles['reservationDetail__info-row']}>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Nom complet</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.client?.prenom} {reservation.client?.nom}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Téléphone</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.client?.telephone}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Email</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.client?.email || '-'}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Type pièce</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.client?.type_piece || 'CNI'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voyage Info */}
                    <div className={styles.reservationDetail__card}>
                        <div className={styles['reservationDetail__card-header']}>
                            <div className={styles['reservationDetail__card-icon']}>
                                <MapPin size={18} />
                            </div>
                            <h2 className={styles['reservationDetail__card-title']}>Détails du Voyage</h2>
                        </div>
                        <div className={styles['reservationDetail__card-content']}>
                            <div className={styles['reservationDetail__info-row']}>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Départ</span>
                                    <span className={`${styles.reservationDetail__value} ${styles['reservationDetail__value--large']}`}>
                                        {reservation.voyage?.ville_depart_nom}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(reservation.voyage?.date_depart)} à {reservation.voyage?.heure_depart}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Arrivée</span>
                                    <span className={`${styles.reservationDetail__value} ${styles['reservationDetail__value--large']}`}>
                                        {reservation.voyage?.ville_arrivee_nom}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        (Estimée)
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Transport</span>
                                    <div className="flex items-center gap-2">
                                        {reservation.voyage?.type_transport === TRANSPORT_TYPES.PLANE ? <Plane size={16} /> : <Bus size={16} />}
                                        <span className={styles.reservationDetail__value}>
                                            {reservation.voyage?.type_transport === TRANSPORT_TYPES.PLANE ? 'Avion' : 'Bus'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Compagnie</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.agence?.nom}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className={styles.reservationDetail__card}>
                        <div className={styles['reservationDetail__card-header']}>
                            <div className={styles['reservationDetail__card-icon']}>
                                <CreditCard size={18} />
                            </div>
                            <h2 className={styles['reservationDetail__card-title']}>Paiement</h2>
                        </div>
                        <div className={styles['reservationDetail__card-content']}>
                            <div className={styles['reservationDetail__info-row']}>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Montant Total</span>
                                    <span className={`${styles.reservationDetail__value} ${styles['reservationDetail__value--large']} text-green-600`}>
                                        {formatCurrency(reservation.montant_total || reservation.prix_total)}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Mode de paiement</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.mode_paiement || 'Non défini'}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Nombre de places</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.nombre_places}
                                    </span>
                                </div>
                                <div className={styles['reservationDetail__info-item']}>
                                    <span className={styles.reservationDetail__label}>Statut Paiement</span>
                                    <span className={styles.reservationDetail__value}>
                                        {reservation.statut_paiement || 'En attente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: QR Code & Status */}
                <div className={styles.reservationDetail__sidebar}>
                    <div className={`${styles.reservationDetail__card} ${styles.reservationDetail__qrcode}`}>
                        <div className={styles['reservationDetail__qr-section']}>
                            <div className={styles['reservationDetail__qr-wrapper']}>
                                <QRCodeSVG
                                    value={qrData}
                                    size={180}
                                    level="M"
                                    className={styles['reservationDetail__qr-code']}
                                />
                            </div>
                            <div>
                                <div className={styles['reservationDetail__code']}>
                                    {reservation.code_reservation || reservation.numero_reservation}
                                </div>
                                <p className={styles['reservationDetail__qr-label']}>
                                    Code à présenter à l'embarquement
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReservationDetails;
