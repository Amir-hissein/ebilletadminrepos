import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    UserPlus,
    MapPin,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    CreditCard,
    Calculator,
    Bus,
    Plane,
    Search,
    Phone,
    Mail,
    CalendarX,
    DollarSign,
    X
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
        <div className={styles.enterprise_container}>
            {/* Header */}
            <header className={styles.form_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.navigation_row}>
                        <button type="button" onClick={() => navigate('/reservations')} className={styles.back_link_pro}>
                            <ArrowLeft size={16} />
                            Retour au registre
                        </button>
                    </div>
                    <div className={styles.greeting_row}>
                        <h1 className={styles.form_title}>Nouvelle Réservation</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système d'émission Live</span>
                        </div>
                    </div>
                    <p className={styles.form_subtitle}>Configurez les détails du billet et validez les informations passager</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className={styles.form_main_pro}>
                {/* Section Client */}
                <div className={styles.section_card_pro}>
                    <div className={styles.section_header_pro}>
                        <div className={styles.section_icon_pro}>
                            <User size={18} />
                        </div>
                        <h2>Identification du Passager</h2>
                    </div>

                    <div className={styles.section_body_pro}>
                        {/* Client Type Toggle */}
                        <div className={styles.client_toggle_pro}>
                            <button
                                type="button"
                                className={`${styles.toggle_btn_pro} ${clientType === 'existing' ? styles.active : ''}`}
                                onClick={() => setClientType('existing')}
                            >
                                <Users size={18} />
                                <span>Client Répertorié</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.toggle_btn_pro} ${clientType === 'new' ? styles.active : ''}`}
                                onClick={() => setClientType('new')}
                            >
                                <UserPlus size={18} />
                                <span>Nouveau Profil</span>
                            </button>
                        </div>

                        {clientType === 'existing' ? (
                            <div className={styles.input_grid_pro}>
                                <div className={`${styles.field_pro} ${styles.full_width}`}>
                                    <label>Sélectionner un passager</label>
                                    <div className={styles.search_client_selection}>
                                        <div className={styles.search_bar_pro}>
                                            <Search className={styles.search_icon} size={16} />
                                            <input
                                                type="text"
                                                placeholder="Filtrer par nom ou téléphone..."
                                                value={searchClient}
                                                onChange={(e) => setSearchClient(e.target.value)}
                                                className={styles.search_input_inner}
                                            />
                                        </div>
                                        <select
                                            className={`${styles.pro_select_list} ${errors.client_id ? styles.error : ''}`}
                                            value={formData.client_id}
                                            onChange={(e) => handleChange('client_id', e.target.value)}
                                            size={5}
                                        >
                                            {filteredClients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.prenom} {client.nom} - {client.telephone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.client_id && <span className={styles.error_text}>{errors.client_id}</span>}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.input_grid_pro}>
                                <div className={styles.field_pro}>
                                    <label className={styles.required}>Nom</label>
                                    <div className={styles.enhanced_input_wrapper}>
                                        <User className={styles.field_icon} size={16} />
                                        <input
                                            type="text"
                                            className={`${styles.pro_input} ${errors.client_nom ? styles.error : ''}`}
                                            placeholder="Nom de famille"
                                            value={formData.client_nom}
                                            onChange={(e) => handleChange('client_nom', e.target.value)}
                                        />
                                    </div>
                                    {errors.client_nom && <span className={styles.error_text}>{errors.client_nom}</span>}
                                </div>
                                <div className={styles.field_pro}>
                                    <label className={styles.required}>Prénom</label>
                                    <div className={styles.enhanced_input_wrapper}>
                                        <User className={styles.field_icon} size={16} />
                                        <input
                                            type="text"
                                            className={`${styles.pro_input} ${errors.client_prenom ? styles.error : ''}`}
                                            placeholder="Prénom"
                                            value={formData.client_prenom}
                                            onChange={(e) => handleChange('client_prenom', e.target.value)}
                                        />
                                    </div>
                                    {errors.client_prenom && <span className={styles.error_text}>{errors.client_prenom}</span>}
                                </div>
                                <div className={styles.field_pro}>
                                    <label className={styles.required}>Téléphone</label>
                                    <div className={styles.enhanced_input_wrapper}>
                                        <Phone className={styles.field_icon} size={16} />
                                        <input
                                            type="tel"
                                            className={`${styles.pro_input} ${errors.client_telephone ? styles.error : ''}`}
                                            placeholder="+242 XXX XX XX"
                                            value={formData.client_telephone}
                                            onChange={(e) => handleChange('client_telephone', e.target.value)}
                                        />
                                    </div>
                                    {errors.client_telephone && <span className={styles.error_text}>{errors.client_telephone}</span>}
                                </div>
                                <div className={styles.field_pro}>
                                    <label>Email (Optionnel)</label>
                                    <div className={styles.enhanced_input_wrapper}>
                                        <Mail className={styles.field_icon} size={16} />
                                        <input
                                            type="email"
                                            className={styles.pro_input}
                                            placeholder="passager@exemple.com"
                                            value={formData.client_email}
                                            onChange={(e) => handleChange('client_email', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.field_pro}>
                                    <label>Pièce d'identité</label>
                                    <select
                                        className={styles.pro_select}
                                        value={formData.client_type_piece}
                                        onChange={(e) => handleChange('client_type_piece', e.target.value)}
                                    >
                                        <option value="CNI">CNI</option>
                                        <option value="passeport">Passeport</option>
                                        <option value="permis">Permis de conduire</option>
                                    </select>
                                </div>
                                <div className={styles.field_pro}>
                                    <label>Numéro de pièce</label>
                                    <input
                                        type="text"
                                        className={styles.pro_input}
                                        placeholder="Numéro du document"
                                        value={formData.client_numero_piece}
                                        onChange={(e) => handleChange('client_numero_piece', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Voyage */}
                <div className={styles.section_card_pro}>
                    <div className={styles.section_header_pro}>
                        <div className={`${styles.section_icon_pro} ${styles.icon_route}`}>
                            <MapPin size={18} />
                        </div>
                        <h2>Sélection de l'Itinéraire</h2>
                    </div>

                    <div className={styles.section_body_pro}>
                        {errors.voyage_id && <div className={styles.form_error_box}>{errors.voyage_id}</div>}

                        <div className={styles.voyage_grid_pro}>
                            {voyages.length === 0 ? (
                                <div className={styles.empty_state_pro}>
                                    <CalendarX size={40} />
                                    <h3>Aucun voyage disponible</h3>
                                    <p>Il n'y a pas de liaisons planifiées pour le moment.</p>
                                </div>
                            ) : voyages.map(voyage => (
                                <div
                                    key={voyage.id}
                                    className={`${styles.voyage_card_pro} ${selectedVoyage?.id === voyage.id ? styles.selected : ''} ${voyage.places_disponibles <= 0 ? styles.disabled : ''}`}
                                    onClick={() => handleVoyageSelect(voyage)}
                                >
                                    <div className={styles.voyage_header_pro}>
                                        <span className={styles.transport_type}>
                                            {voyage.type_transport === TRANSPORT_TYPES.PLANE ? <Plane size={14} /> : <Bus size={14} />}
                                            {voyage.type_transport === TRANSPORT_TYPES.PLANE ? 'Vol' : 'Bus'}
                                        </span>
                                        <div className={styles.price_tag}>{formatCurrency(voyage.prix_unitaire)}</div>
                                    </div>
                                    <div className={styles.voyage_route_pro}>
                                        <div className={styles.loc_step}>
                                            <span className={styles.city}>{voyage.ville_depart_nom}</span>
                                            <span className={styles.hour}>{voyage.heure_depart}</span>
                                        </div>
                                        <div className={styles.route_line}>
                                            <ArrowRight size={14} />
                                        </div>
                                        <div className={styles.loc_step}>
                                            <span className={styles.city}>{voyage.ville_arrivee_nom}</span>
                                            <span className={styles.hour}>Terminus</span>
                                        </div>
                                    </div>
                                    <div className={styles.voyage_footer_pro}>
                                        <div className={styles.meta_item}>
                                            <Calendar size={12} />
                                            <span>{formatDate(voyage.date_depart)}</span>
                                        </div>
                                        <div className={`${styles.places_count_pro} ${voyage.places_disponibles < 5 ? styles.low : ''}`}>
                                            {voyage.places_disponibles} places
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section Réservation */}
                <div className={styles.section_card_pro}>
                    <div className={styles.section_header_pro}>
                        <div className={`${styles.section_icon_pro} ${styles.icon_payment}`}>
                            <CreditCard size={18} />
                        </div>
                        <h2>Détails & Facturation</h2>
                    </div>

                    <div className={styles.section_body_pro}>
                        <div className={styles.input_grid_pro}>
                            <div className={styles.field_pro}>
                                <label className={styles.required}>Nombre de places</label>
                                <div className={styles.enhanced_input_wrapper}>
                                    <Users className={styles.field_icon} size={16} />
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedVoyage?.places_disponibles || 10}
                                        className={`${styles.pro_input} ${errors.nombre_places ? styles.error : ''}`}
                                        value={formData.nombre_places}
                                        onChange={(e) => handleChange('nombre_places', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                {errors.nombre_places && <span className={styles.error_text}>{errors.nombre_places}</span>}
                            </div>
                            <div className={styles.field_pro}>
                                <label className={styles.required}>Mode de paiement</label>
                                <div className={styles.enhanced_select_wrapper}>
                                    <CreditCard className={styles.field_icon} size={16} />
                                    <select
                                        className={`${styles.pro_select} ${errors.mode_paiement ? styles.error : ''}`}
                                        value={formData.mode_paiement}
                                        onChange={(e) => handleChange('mode_paiement', e.target.value)}
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="especes">Espèces</option>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="carte">Carte bancaire</option>
                                        <option value="virement">Virement</option>
                                    </select>
                                </div>
                                {errors.mode_paiement && <span className={styles.error_text}>{errors.mode_paiement}</span>}
                            </div>
                            <div className={`${styles.field_pro} ${styles.full_width}`}>
                                <label>Instructions particulières</label>
                                <textarea
                                    className={styles.pro_textarea}
                                    placeholder="Bagages spéciaux, demandes particulières..."
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {selectedVoyage && (
                            <div className={styles.pricing_summary_pro}>
                                <div className={styles.pricing_header}>
                                    <Calculator size={18} />
                                    <span>Estimation du coût total</span>
                                </div>
                                <div className={styles.pricing_rows}>
                                    <div className={styles.p_row}>
                                        <span>Prix unitaire billet</span>
                                        <span>{formatCurrency(selectedVoyage.prix_unitaire)}</span>
                                    </div>
                                    <div className={styles.p_row}>
                                        <span>Nombre de passagers</span>
                                        <span>× {formData.nombre_places}</span>
                                    </div>
                                    <div className={`${styles.p_row} ${styles.total}`}>
                                        <span>Total à percevoir</span>
                                        <span className={styles.total_value}>{formatCurrency(montantTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.form_actions_pro}>
                    <button
                        type="button"
                        className={styles.btn_cancel_pro}
                        onClick={() => navigate('/reservations')}
                    >
                        Abandonner
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !selectedVoyage}
                        className={styles.btn_submit_pro}
                    >
                        {submitting ? 'Emission en cours...' : 'Générer la Réservation'}
                    </button>
                </div>

                {errors.submit && <div className={styles.final_error_box}>{errors.submit}</div>}
            </form>
        </div>
    );
}

export default ReservationForm;
