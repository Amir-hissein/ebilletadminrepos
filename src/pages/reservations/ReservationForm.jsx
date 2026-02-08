import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    UserPlus,
    MapPin,
    ArrowRight,
    Calendar,
    Clock,
    Users,
    CreditCard,
    Calculator,
    Bus,
    Plane,
    Search
} from 'lucide-react';
import { getVoyages } from '../../api/voyages.api';
import { getClients, createClient, createReservation } from '../../api/reservations.api';
import { getAgencies } from '../../api/agencies.api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { TRANSPORT_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import styles from './ReservationForm.module.css';

function ReservationForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [voyages, setVoyages] = useState([]);
    const [clients, setClients] = useState([]);
    const [agencies, setAgencies] = useState([]);

    // Client type toggle
    const [clientType, setClientType] = useState('existing'); // 'existing' or 'new'

    // Form data
    const [formData, setFormData] = useState({
        // Client existant
        client_id: '',
        // Nouveau client
        client_nom: '',
        client_prenom: '',
        client_telephone: '',
        client_email: '',
        client_type_piece: 'CNI',
        client_numero_piece: '',
        // Voyage
        voyage_id: '',
        // Réservation
        nombre_places: 1,
        mode_paiement: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [selectedVoyage, setSelectedVoyage] = useState(null);
    const [searchClient, setSearchClient] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [voyagesResult, clientsResult, agenciesResult] = await Promise.all([
                getVoyages({ statut: 'planifie' }),
                getClients(),
                getAgencies()
            ]);
            setVoyages(voyagesResult.data || []);
            setClients(clientsResult.data || []);
            setAgencies(agenciesResult.data || []);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleVoyageSelect = (voyage) => {
        if (voyage.places_disponibles <= 0) return;
        setSelectedVoyage(voyage);
        handleChange('voyage_id', voyage.id);
        // Reset nombre_places if greater than available
        if (formData.nombre_places > voyage.places_disponibles) {
            handleChange('nombre_places', voyage.places_disponibles);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Client validation
        if (clientType === 'existing') {
            if (!formData.client_id) {
                newErrors.client_id = 'Veuillez sélectionner un client';
            }
        } else {
            if (!formData.client_nom?.trim()) {
                newErrors.client_nom = 'Le nom est requis';
            }
            if (!formData.client_prenom?.trim()) {
                newErrors.client_prenom = 'Le prénom est requis';
            }
            if (!formData.client_telephone?.trim()) {
                newErrors.client_telephone = 'Le téléphone est requis';
            }
        }

        // Voyage validation
        if (!formData.voyage_id) {
            newErrors.voyage_id = 'Veuillez sélectionner un voyage';
        }

        // Places validation
        if (!formData.nombre_places || formData.nombre_places < 1) {
            newErrors.nombre_places = 'Minimum 1 place';
        } else if (selectedVoyage && formData.nombre_places > selectedVoyage.places_disponibles) {
            newErrors.nombre_places = `Maximum ${selectedVoyage.places_disponibles} places disponibles`;
        }

        // Payment mode
        if (!formData.mode_paiement) {
            newErrors.mode_paiement = 'Veuillez sélectionner un mode de paiement';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            let clientId = formData.client_id;

            // Create new client if needed
            if (clientType === 'new') {
                const newClient = await createClient({
                    nom: formData.client_nom,
                    prenom: formData.client_prenom,
                    telephone: formData.client_telephone,
                    email: formData.client_email || null,
                    type_piece: formData.client_type_piece,
                    numero_piece: formData.client_numero_piece || null
                });
                clientId = newClient.id;
            }

            // Create reservation
            await createReservation({
                voyage_id: parseInt(formData.voyage_id),
                client_id: parseInt(clientId),
                agence_id: selectedVoyage?.agence?.id,
                agent_id: 1, // Current user (demo)
                nombre_places: parseInt(formData.nombre_places),
                mode_paiement: formData.mode_paiement,
                notes: formData.notes
            });

            navigate('/reservations');
        } catch (error) {
            console.error('Erreur création réservation:', error);
            setErrors({ submit: 'Erreur lors de la création de la réservation' });
        } finally {
            setSubmitting(false);
        }
    };

    // Filter clients by search
    const filteredClients = clients.filter(client => {
        if (!searchClient) return true;
        const search = searchClient.toLowerCase();
        return (
            client.nom?.toLowerCase().includes(search) ||
            client.prenom?.toLowerCase().includes(search) ||
            client.telephone?.includes(search)
        );
    });

    // Calculate totals
    const montantTotal = selectedVoyage
        ? selectedVoyage.prix_unitaire * formData.nombre_places
        : 0;
    const commissionPlateforme = montantTotal * 0.10;
    const montantAgence = montantTotal - commissionPlateforme;

    const getPlacesClass = (places) => {
        if (places === 0) return styles['reservationForm__voyage-places--none'];
        if (places <= 5) return styles['reservationForm__voyage-places--low'];
        return '';
    };

    if (loading) {
        return <div className={styles.reservationForm}>Chargement...</div>;
    }

    return (
        <div className={styles.reservationForm}>
            {/* Header */}
            <div className={styles.reservationForm__header}>
                <h1 className={styles.reservationForm__title}>Nouvelle Réservation</h1>
                <p className={styles.reservationForm__subtitle}>
                    Créez une réservation pour un client
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.reservationForm__form}>
                {/* Section Client */}
                <div className={styles.reservationForm__section}>
                    <div className={styles['reservationForm__section-header']}>
                        <div className={styles['reservationForm__section-icon']}>
                            <User size={18} />
                        </div>
                        <h2 className={styles['reservationForm__section-title']}>
                            Informations Client
                        </h2>
                    </div>

                    {/* Client Type Toggle */}
                    <div className={styles['reservationForm__client-toggle']}>
                        <button
                            type="button"
                            className={`${styles['reservationForm__toggle-btn']} ${clientType === 'existing' ? styles['reservationForm__toggle-btn--active'] : ''}`}
                            onClick={() => setClientType('existing')}
                        >
                            <User size={18} />
                            Client existant
                        </button>
                        <button
                            type="button"
                            className={`${styles['reservationForm__toggle-btn']} ${clientType === 'new' ? styles['reservationForm__toggle-btn--active'] : ''}`}
                            onClick={() => setClientType('new')}
                        >
                            <UserPlus size={18} />
                            Nouveau client
                        </button>
                    </div>

                    {clientType === 'existing' ? (
                        <div className={styles.reservationForm__field}>
                            <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                Rechercher un client
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    className={styles.reservationForm__input}
                                    placeholder="Rechercher par nom, prénom ou téléphone..."
                                    value={searchClient}
                                    onChange={(e) => setSearchClient(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                            <select
                                className={`${styles.reservationForm__select} ${errors.client_id ? styles['reservationForm__select--error'] : ''}`}
                                value={formData.client_id}
                                onChange={(e) => handleChange('client_id', e.target.value)}
                                size={5}
                                style={{ height: 'auto', marginTop: 8 }}
                            >
                                {filteredClients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.prenom} {client.nom} - {client.telephone}
                                    </option>
                                ))}
                            </select>
                            {errors.client_id && (
                                <span className={styles.reservationForm__error}>{errors.client_id}</span>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={styles.reservationForm__row}>
                                <div className={styles.reservationForm__field}>
                                    <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.reservationForm__input} ${errors.client_nom ? styles['reservationForm__input--error'] : ''}`}
                                        placeholder="Nom de famille"
                                        value={formData.client_nom}
                                        onChange={(e) => handleChange('client_nom', e.target.value)}
                                    />
                                    {errors.client_nom && (
                                        <span className={styles.reservationForm__error}>{errors.client_nom}</span>
                                    )}
                                </div>
                                <div className={styles.reservationForm__field}>
                                    <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.reservationForm__input} ${errors.client_prenom ? styles['reservationForm__input--error'] : ''}`}
                                        placeholder="Prénom"
                                        value={formData.client_prenom}
                                        onChange={(e) => handleChange('client_prenom', e.target.value)}
                                    />
                                    {errors.client_prenom && (
                                        <span className={styles.reservationForm__error}>{errors.client_prenom}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.reservationForm__row}>
                                <div className={styles.reservationForm__field}>
                                    <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        className={`${styles.reservationForm__input} ${errors.client_telephone ? styles['reservationForm__input--error'] : ''}`}
                                        placeholder="+235 66 XX XX XX"
                                        value={formData.client_telephone}
                                        onChange={(e) => handleChange('client_telephone', e.target.value)}
                                    />
                                    {errors.client_telephone && (
                                        <span className={styles.reservationForm__error}>{errors.client_telephone}</span>
                                    )}
                                </div>
                                <div className={styles.reservationForm__field}>
                                    <label className={styles.reservationForm__label}>
                                        Email (optionnel)
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.reservationForm__input}
                                        placeholder="email@exemple.com"
                                        value={formData.client_email}
                                        onChange={(e) => handleChange('client_email', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.reservationForm__row}>
                                <div className={styles.reservationForm__field}>
                                    <label className={styles.reservationForm__label}>
                                        Type de pièce
                                    </label>
                                    <select
                                        className={styles.reservationForm__select}
                                        value={formData.client_type_piece}
                                        onChange={(e) => handleChange('client_type_piece', e.target.value)}
                                    >
                                        <option value="CNI">Carte Nationale d'Identité</option>
                                        <option value="passeport">Passeport</option>
                                        <option value="permis">Permis de conduire</option>
                                    </select>
                                </div>
                                <div className={styles.reservationForm__field}>
                                    <label className={styles.reservationForm__label}>
                                        Numéro de pièce (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.reservationForm__input}
                                        placeholder="Numéro de la pièce"
                                        value={formData.client_numero_piece}
                                        onChange={(e) => handleChange('client_numero_piece', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Section Voyage */}
                <div className={styles.reservationForm__section}>
                    <div className={styles['reservationForm__section-header']}>
                        <div className={styles['reservationForm__section-icon']}>
                            <MapPin size={18} />
                        </div>
                        <h2 className={styles['reservationForm__section-title']}>
                            Sélection du Voyage
                        </h2>
                    </div>

                    {errors.voyage_id && (
                        <span className={styles.reservationForm__error} style={{ marginBottom: 12, display: 'block' }}>
                            {errors.voyage_id}
                        </span>
                    )}

                    <div className={styles['reservationForm__voyage-list']}>
                        {voyages.length === 0 ? (
                            <div className={styles['reservationForm__empty-voyages']}>
                                Aucun voyage disponible
                            </div>
                        ) : voyages.map(voyage => (
                            <div
                                key={voyage.id}
                                className={`
                                    ${styles['reservationForm__voyage-card']}
                                    ${selectedVoyage?.id === voyage.id ? styles['reservationForm__voyage-card--selected'] : ''}
                                    ${voyage.places_disponibles <= 0 ? styles['reservationForm__voyage-card--disabled'] : ''}
                                `}
                                onClick={() => handleVoyageSelect(voyage)}
                            >
                                <div className={styles['reservationForm__voyage-route']}>
                                    {voyage.type_transport === TRANSPORT_TYPES.PLANE ? (
                                        <Plane size={16} />
                                    ) : (
                                        <Bus size={16} />
                                    )}
                                    <span>{voyage.ville_depart_nom}</span>
                                    <ArrowRight size={16} className={styles['reservationForm__voyage-arrow']} />
                                    <span>{voyage.ville_arrivee_nom}</span>
                                    <span className={styles['reservationForm__voyage-price']}>
                                        {formatCurrency(voyage.prix_unitaire)}
                                    </span>
                                </div>
                                <div className={styles['reservationForm__voyage-meta']}>
                                    <span className={styles['reservationForm__voyage-meta-item']}>
                                        <Calendar size={14} />
                                        {formatDate(voyage.date_depart)}
                                    </span>
                                    <span className={styles['reservationForm__voyage-meta-item']}>
                                        <Clock size={14} />
                                        {voyage.heure_depart}
                                    </span>
                                    <span className={styles['reservationForm__voyage-meta-item']}>
                                        {voyage.numero_vol_bus}
                                    </span>
                                    <span className={`${styles['reservationForm__voyage-places']} ${getPlacesClass(voyage.places_disponibles)}`}>
                                        {voyage.places_disponibles} places
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Réservation */}
                <div className={styles.reservationForm__section}>
                    <div className={styles['reservationForm__section-header']}>
                        <div className={styles['reservationForm__section-icon']}>
                            <CreditCard size={18} />
                        </div>
                        <h2 className={styles['reservationForm__section-title']}>
                            Détails de la Réservation
                        </h2>
                    </div>

                    <div className={styles.reservationForm__row}>
                        <div className={styles.reservationForm__field}>
                            <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                Nombre de places
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedVoyage?.places_disponibles || 10}
                                className={`${styles.reservationForm__input} ${errors.nombre_places ? styles['reservationForm__input--error'] : ''}`}
                                value={formData.nombre_places}
                                onChange={(e) => handleChange('nombre_places', parseInt(e.target.value) || 1)}
                            />
                            {errors.nombre_places && (
                                <span className={styles.reservationForm__error}>{errors.nombre_places}</span>
                            )}
                        </div>
                        <div className={styles.reservationForm__field}>
                            <label className={`${styles.reservationForm__label} ${styles['reservationForm__label--required']}`}>
                                Mode de paiement
                            </label>
                            <select
                                className={`${styles.reservationForm__select} ${errors.mode_paiement ? styles['reservationForm__select--error'] : ''}`}
                                value={formData.mode_paiement}
                                onChange={(e) => handleChange('mode_paiement', e.target.value)}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="especes">Espèces</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="carte">Carte bancaire</option>
                                <option value="virement">Virement</option>
                            </select>
                            {errors.mode_paiement && (
                                <span className={styles.reservationForm__error}>{errors.mode_paiement}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.reservationForm__field}>
                        <label className={styles.reservationForm__label}>
                            Notes (optionnel)
                        </label>
                        <textarea
                            className={styles.reservationForm__input}
                            placeholder="Remarques sur la réservation..."
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* Price Summary */}
                    {selectedVoyage && (
                        <div className={styles['reservationForm__price-summary']}>
                            <div className={styles['reservationForm__price-header']}>
                                <Calculator size={18} />
                                Récapitulatif du montant
                            </div>
                            <div className={styles['reservationForm__price-rows']}>
                                <div className={styles['reservationForm__price-row']}>
                                    <span>Prix unitaire</span>
                                    <span>{formatCurrency(selectedVoyage.prix_unitaire)}</span>
                                </div>
                                <div className={styles['reservationForm__price-row']}>
                                    <span>Nombre de places</span>
                                    <span>× {formData.nombre_places}</span>
                                </div>
                                <div className={`${styles['reservationForm__price-row']} ${styles['reservationForm__price-row--total']}`}>
                                    <span>Total à payer</span>
                                    <span>{formatCurrency(montantTotal)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.reservationForm__actions}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/reservations')}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        loading={submitting}
                        disabled={!selectedVoyage}
                    >
                        Créer la réservation
                    </Button>
                </div>

                {errors.submit && (
                    <p className={styles.reservationForm__error} style={{ textAlign: 'center' }}>
                        {errors.submit}
                    </p>
                )}
            </form>
        </div>
    );
}

export default ReservationForm;
