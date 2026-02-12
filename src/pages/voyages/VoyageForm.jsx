import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, ArrowRight, Bus, Plane,
    Calendar, Clock, Users, DollarSign, Save,
    Building2, Info, CheckCircle, AlertCircle, Hash
} from 'lucide-react';
import { getVoyages, getVoyageById, createVoyage, updateVoyage, getVilles } from '../../api/voyages.api';
import { getAgencies } from '../../api/agencies.api';
import { TRANSPORT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import styles from './VoyageForm.module.css';

const VoyageForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [villes, setVilles] = useState([]);
    const [agences, setAgences] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        agence_id: '',
        ville_depart_id: '',
        ville_arrivee_id: '',
        date_depart: '',
        heure_depart: '',
        date_arrivee: '',
        heure_arrivee: '',
        prix_unitaire: '',
        places_totales: '',
        type_transport: TRANSPORT_TYPES.BUS,
        numero_vol_bus: '',
        description: ''
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            const [villesResult, agencesResult] = await Promise.all([
                getVilles({ actif: true }),
                getAgencies({ statut: 'active' })
            ]);
            setVilles(villesResult.data || []);
            setAgences(agencesResult.data || []);

            if (isEdit) {
                const voyage = await getVoyageById(id);
                setFormData({
                    agence_id: voyage.agence_id.toString(),
                    ville_depart_id: voyage.ville_depart_id.toString(),
                    ville_arrivee_id: voyage.ville_arrivee_id.toString(),
                    date_depart: voyage.date_depart,
                    heure_depart: voyage.heure_depart,
                    date_arrivee: voyage.date_arrivee || voyage.date_depart,
                    heure_arrivee: voyage.heure_arrivee || '',
                    prix_unitaire: voyage.prix_unitaire.toString(),
                    places_totales: voyage.places_totales.toString(),
                    type_transport: voyage.type_transport,
                    numero_vol_bus: voyage.numero_vol_bus || '',
                    description: voyage.description || ''
                });
            }
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleTransportSelect = (type) => {
        setFormData(prev => ({ ...prev, type_transport: type }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.agence_id) newErrors.agence_id = 'Sélectionnez une agence';
        if (!formData.ville_depart_id) newErrors.ville_depart_id = 'Ville de départ requise';
        if (!formData.ville_arrivee_id) newErrors.ville_arrivee_id = 'Ville d\'arrivée requise';
        if (formData.ville_depart_id === formData.ville_arrivee_id && formData.ville_depart_id) {
            newErrors.ville_arrivee_id = 'Ville d\'arrivée doit être différente';
        }
        if (!formData.date_depart) newErrors.date_depart = 'Date requise';
        if (!formData.heure_depart) newErrors.heure_depart = 'Heure requise';
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
            newErrors.prix_unitaire = 'Prix invalide';
        }
        if (!formData.places_totales || parseInt(formData.places_totales) <= 0) {
            newErrors.places_totales = 'Places invalides';
        }
        if (!formData.numero_vol_bus.trim()) {
            newErrors.numero_vol_bus = 'Référence requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const voyageData = {
                ...formData,
                agence_id: parseInt(formData.agence_id),
                ville_depart_id: parseInt(formData.ville_depart_id),
                ville_arrivee_id: parseInt(formData.ville_arrivee_id),
                prix_unitaire: parseFloat(formData.prix_unitaire),
                places_totales: parseInt(formData.places_totales)
            };

            if (isEdit) {
                await updateVoyage(id, voyageData);
            } else {
                await createVoyage(voyageData);
            }
            navigate('/voyages');
        } catch (error) {
            console.error('Erreur sauvegarde voyage:', error);
            setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
        } finally {
            setLoading(false);
        }
    };

    const prixUnitaire = parseFloat(formData.prix_unitaire) || 0;
    const placesTotales = parseInt(formData.places_totales) || 0;
    const potentielTotal = prixUnitaire * placesTotales;
    const commission = potentielTotal * 0.1;

    return (
        <div className={`fade-in ${styles.voyage_form_pro}`}>
            {/* Header Pro */}
            <header className={styles.form_header_pro}>
                <div className={styles.header_content}>
                    <button onClick={() => navigate('/voyages')} className={styles.back_pill}>
                        <ArrowLeft size={16} />
                        <span>Voyages</span>
                    </button>
                    <h1>{isEdit ? 'Modifier le trajet' : 'Planifier un nouveau trajet'}</h1>
                    <p>{isEdit ? 'Mettez à jour les détails du transport et du trajet' : 'Configurez les détails du transport, l\'itinéraire et la tarification.'}</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className={styles.form_container_pro}>
                <div className={styles.form_grid_pro}>
                    {/* Left Column: Config & Route */}
                    <div className={styles.main_column}>
                        {/* Configuration Card */}
                        <div className={styles.form_card_pro}>
                            <div className={styles.card_header}>
                                <div className={styles.icon_box}><Building2 size={20} /></div>
                                <h3>Configuration Générale</h3>
                            </div>
                            <div className={styles.card_body}>
                                <div className={styles.field_group_pro}>
                                    <label>Agence organisatrice</label>
                                    <div className={styles.select_wrapper}>
                                        <Building2 className={styles.field_icon} size={18} />
                                        <select
                                            name="agence_id"
                                            value={formData.agence_id}
                                            onChange={handleChange}
                                            className={errors.agence_id ? styles.input_error : ''}
                                        >
                                            <option value="">Sélectionner une agence</option>
                                            {agences.map(agence => (
                                                <option key={agence.id} value={agence.id}>{agence.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.agence_id && <span className={styles.error_text}>{errors.agence_id}</span>}
                                </div>

                                <div className={styles.transport_selector}>
                                    <label>Type de transport</label>
                                    <div className={styles.transport_options}>
                                        <div
                                            className={`${styles.transport_card} ${formData.type_transport === TRANSPORT_TYPES.BUS ? styles.active : ''}`}
                                            onClick={() => handleTransportSelect(TRANSPORT_TYPES.BUS)}
                                        >
                                            <Bus size={24} />
                                            <span>Bus</span>
                                            {formData.type_transport === TRANSPORT_TYPES.BUS && <CheckCircle size={14} className={styles.check} />}
                                        </div>
                                        <div
                                            className={`${styles.transport_card} ${formData.type_transport === TRANSPORT_TYPES.PLANE ? styles.active : ''}`}
                                            onClick={() => handleTransportSelect(TRANSPORT_TYPES.PLANE)}
                                        >
                                            <Plane size={24} />
                                            <span>Avion</span>
                                            {formData.type_transport === TRANSPORT_TYPES.PLANE && <CheckCircle size={14} className={styles.check} />}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.field_group_pro}>
                                    <label>N° de {formData.type_transport === TRANSPORT_TYPES.PLANE ? 'vol' : 'bus'}</label>
                                    <div className={styles.input_wrapper}>
                                        <Hash className={styles.field_icon} size={18} />
                                        <input
                                            type="text"
                                            name="numero_vol_bus"
                                            value={formData.numero_vol_bus}
                                            onChange={handleChange}
                                            placeholder={formData.type_transport === TRANSPORT_TYPES.PLANE ? 'Ex: AF123' : 'Ex: B-450'}
                                            className={errors.numero_vol_bus ? styles.input_error : ''}
                                        />
                                    </div>
                                    {errors.numero_vol_bus && <span className={styles.error_text}>{errors.numero_vol_bus}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Itinerary Card */}
                        <div className={styles.form_card_pro}>
                            <div className={styles.card_header}>
                                <div className={styles.icon_box}><MapPin size={20} /></div>
                                <h3>Itinéraire & Horaires</h3>
                            </div>
                            <div className={styles.card_body}>
                                <div className={styles.route_visual}>
                                    <div className={styles.route_field}>
                                        <label>Départ</label>
                                        <div className={styles.select_wrapper}>
                                            <MapPin className={styles.field_icon} size={18} />
                                            <select
                                                name="ville_depart_id"
                                                value={formData.ville_depart_id}
                                                onChange={handleChange}
                                                className={errors.ville_depart_id ? styles.input_error : ''}
                                            >
                                                <option value="">Sélectionner</option>
                                                {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.route_arrow}><ArrowRight size={20} /></div>
                                    <div className={styles.route_field}>
                                        <label>Arrivée</label>
                                        <div className={styles.select_wrapper}>
                                            <MapPin className={styles.field_icon} size={18} />
                                            <select
                                                name="ville_arrivee_id"
                                                value={formData.ville_arrivee_id}
                                                onChange={handleChange}
                                                className={errors.ville_arrivee_id ? styles.input_error : ''}
                                            >
                                                <option value="">Sélectionner</option>
                                                {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.times_grid}>
                                    <div className={styles.field_group_pro}>
                                        <label>Date de départ</label>
                                        <div className={styles.input_wrapper}>
                                            <Calendar className={styles.field_icon} size={18} />
                                            <input
                                                type="date"
                                                name="date_depart"
                                                value={formData.date_depart}
                                                onChange={handleChange}
                                                className={errors.date_depart ? styles.input_error : ''}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.field_group_pro}>
                                        <label>Heure de départ</label>
                                        <div className={styles.input_wrapper}>
                                            <Clock className={styles.field_icon} size={18} />
                                            <input
                                                type="time"
                                                name="heure_depart"
                                                value={formData.heure_depart}
                                                onChange={handleChange}
                                                className={errors.heure_depart ? styles.input_error : ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Summary */}
                    <div className={styles.side_column}>
                        <div className={styles.form_card_pro}>
                            <div className={styles.card_header}>
                                <div className={styles.icon_box}><DollarSign size={20} /></div>
                                <h3>Tarification</h3>
                            </div>
                            <div className={styles.card_body}>
                                <div className={styles.field_group_pro}>
                                    <label>Prix unitaire (FCFA)</label>
                                    <div className={styles.input_wrapper}>
                                        <DollarSign className={styles.field_icon} size={18} />
                                        <input
                                            type="number"
                                            name="prix_unitaire"
                                            value={formData.prix_unitaire}
                                            onChange={handleChange}
                                            className={errors.prix_unitaire ? styles.input_error : ''}
                                            placeholder="Ex: 10000"
                                        />
                                    </div>
                                </div>
                                <div className={styles.field_group_pro}>
                                    <label>Nombre de places</label>
                                    <div className={styles.input_wrapper}>
                                        <Users className={styles.field_icon} size={18} />
                                        <input
                                            type="number"
                                            name="places_totales"
                                            value={formData.places_totales}
                                            onChange={handleChange}
                                            className={errors.places_totales ? styles.input_error : ''}
                                            placeholder="Ex: 50"
                                        />
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className={styles.finance_summary}>
                                    <div className={styles.summary_header}>
                                        <Info size={14} />
                                        Résumé financier
                                    </div>
                                    <div className={styles.summary_row}>
                                        <span>Potentiel brut</span>
                                        <span>{formatCurrency(potentielTotal)}</span>
                                    </div>
                                    <div className={styles.summary_row}>
                                        <span>Commission (10%)</span>
                                        <span className={styles.commission}>-{formatCurrency(commission)}</span>
                                    </div>
                                    <div className={styles.summary_total}>
                                        <span>Revenu Net</span>
                                        <span>{formatCurrency(potentielTotal - commission)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.form_card_pro}>
                            <div className={styles.card_body}>
                                <div className={styles.form_actions}>
                                    <button
                                        type="button"
                                        className={styles.btn_secondary}
                                        onClick={() => navigate('/voyages')}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.btn_primary}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sauvegarde...' : <><Save size={18} /> {isEdit ? 'Enregistrer les modifications' : 'Créer le voyage'}</>}
                                    </button>
                                </div>
                                {errors.submit && (
                                    <div className={styles.error_banner}>
                                        <AlertCircle size={14} />
                                        {errors.submit}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default VoyageForm;
