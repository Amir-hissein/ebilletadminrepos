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
    Clock,
    DollarSign,
    ArrowRight,
    Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getReservationById, cancelReservation } from '../../api/reservations.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS, TRANSPORT_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import styles from './ReservationDetails.module.css';

function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuth();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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
        try {
            await cancelReservation(id);
            setIsCancelModalOpen(false);
            loadReservation(); // Reload to see status change
        } catch (err) {
            alert("Erreur lors de l'annulation");
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
        <div className={styles.enterprise_container}>
            {/* Header */}
            <header className={styles.details_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.navigation_row}>
                        <Link to="/reservations" className={styles.back_link_pro}>
                            <ArrowLeft size={16} />
                            Retour au registre
                        </Link>
                    </div>
                    <div className={styles.greeting_row}>
                        <h1 className={styles.details_title}>Réservation #{reservation.code_reservation || reservation.numero_reservation}</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>{RESERVATION_STATUS_LABELS[reservation.statut]}</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        ID Système: {reservation.id} • Émis le {formatDate(reservation.created_at)}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_secondary_pro} onClick={handlePrint}>
                        <Printer size={16} />
                        <span>Imprimer le Billet</span>
                    </button>
                    {!isSuperAdmin && (
                        <>
                            {reservation.statut === RESERVATION_STATUS.CONFIRMED && (
                                <button className={styles.btn_danger_pro} onClick={() => setIsCancelModalOpen(true)}>
                                    <X size={16} />
                                    <span>Annuler</span>
                                </button>
                            )}
                            {reservation.statut === RESERVATION_STATUS.PENDING && (
                                <button className={styles.btn_primary_pro} onClick={() => navigate(`/finance/payments/new?reservation=${id}`)}>
                                    <DollarSign size={16} />
                                    <span>Encaisser Maintenant</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </header>

            <div className={styles.details_grid_pro}>
                {/* Left Column: Info */}
                <div className={styles.main_content_pro}>

                    {/* Client Info */}
                    <div className={styles.card_pro}>
                        <div className={styles.card_header_pro}>
                            <div className={styles.card_icon_pro}>
                                <User size={18} />
                            </div>
                            <h3>Informations Passager</h3>
                        </div>
                        <div className={styles.card_body_pro}>
                            <div className={styles.info_grid_pro}>
                                <div className={styles.info_item_pro}>
                                    <label>Nom complet</label>
                                    <span>{reservation.client?.prenom} {reservation.client?.nom}</span>
                                </div>
                                <div className={styles.info_item_pro}>
                                    <label>Téléphone</label>
                                    <span className={styles.mono_value}>{reservation.client?.telephone}</span>
                                </div>
                                <div className={styles.info_item_pro}>
                                    <label>Email</label>
                                    <span>{reservation.client?.email || '-'}</span>
                                </div>
                                <div className={styles.info_item_pro}>
                                    <label>Document d'identité</label>
                                    <span className={styles.id_tag_pro}>{reservation.client?.type_piece || 'CNI'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voyage Info */}
                    <div className={styles.card_pro}>
                        <div className={styles.card_header_pro}>
                            <div className={`${styles.card_icon_pro} ${styles.icon_route}`}>
                                <MapPin size={18} />
                            </div>
                            <h3>Détails de l'Itinéraire</h3>
                        </div>
                        <div className={styles.card_body_pro}>
                            <div className={styles.itinerary_display_pro}>
                                <div className={styles.itinerary_step}>
                                    <label>Départ</label>
                                    <div className={styles.location_main}>{reservation.voyage?.ville_depart_nom}</div>
                                    <div className={styles.schedule_sub}>
                                        <Calendar size={12} /> {formatDate(reservation.voyage?.date_depart)} à {reservation.voyage?.heure_depart}
                                    </div>
                                </div>
                                <div className={styles.itinerary_connector}>
                                    <ArrowRight size={20} />
                                </div>
                                <div className={styles.itinerary_step}>
                                    <label>Arrivée</label>
                                    <div className={styles.location_main}>{reservation.voyage?.ville_arrivee_nom}</div>
                                    <div className={styles.schedule_sub}>(Arrivée estimée)</div>
                                </div>
                            </div>
                            <div className={styles.transport_meta_pro}>
                                <div className={styles.meta_item}>
                                    {reservation.voyage?.type_transport === TRANSPORT_TYPES.PLANE ? <Plane size={16} /> : <Bus size={16} />}
                                    <span>{reservation.voyage?.type_transport === TRANSPORT_TYPES.PLANE ? 'Vol commercial' : 'Transport terrestre'}</span>
                                </div>
                                <div className={styles.meta_divider}></div>
                                <div className={styles.meta_item}>
                                    <Clock size={16} />
                                    <span>{reservation.agence?.nom}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className={styles.card_pro}>
                        <div className={styles.card_header_pro}>
                            <div className={`${styles.card_icon_pro} ${styles.icon_payment}`}>
                                <CreditCard size={18} />
                            </div>
                            <h3>Paiement & Facturation</h3>
                        </div>
                        <div className={styles.card_body_pro}>
                            <div className={styles.payment_summary_pro}>
                                <div className={styles.payment_column}>
                                    <label>Montant Total</label>
                                    <div className={styles.grand_total_pro}>
                                        {formatCurrency(reservation.montant_total || reservation.prix_total)}
                                    </div>
                                    <div className={styles.places_count}>
                                        <Users size={14} /> {reservation.nombre_places} Passager(s)
                                    </div>
                                </div>
                                <div className={styles.payment_details_grid}>
                                    <div className={styles.detail_row}>
                                        <label>Mode</label>
                                        <span>{reservation.mode_paiement || 'Non défini'}</span>
                                    </div>
                                    <div className={styles.detail_row}>
                                        <label>Statut</label>
                                        <span className={styles[`badge_${reservation.statut_paiement || 'en_attente'}`]}>
                                            {reservation.statut_paiement || 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: QR Code & Status */}
                <div className={styles.sidebar_content_pro}>
                    <div className={`${styles.card_pro} ${styles.qr_card_pro}`}>
                        <div className={styles.qr_header}>
                            <h3>Code d'Embarquement</h3>
                            <p>Scannez ce code au terminal</p>
                        </div>
                        <div className={styles.qr_containment}>
                            <div className={styles.qr_wrapper_pro}>
                                <QRCodeSVG
                                    value={qrData}
                                    size={160}
                                    level="H"
                                    className={styles.qr_code_pro}
                                />
                            </div>
                            <div className={styles.pnr_display_pro}>
                                {reservation.code_reservation || reservation.numero_reservation}
                            </div>
                        </div>
                        <div className={styles.qr_footer}>
                            <p>Présentez une pièce d'identité valide lors du contrôle.</p>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancel}
                title="Annuler la réservation"
                message={`Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible et libérera les places.`}
                confirmLabel="Confirmer l'annulation"
            />
        </div>
    );
}

export default ReservationDetails;
