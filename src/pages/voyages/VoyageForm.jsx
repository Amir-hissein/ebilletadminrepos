import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    ArrowRight,
    Bus,
    Plane,
    Calendar,
    Clock,
    Users,
    DollarSign,
    Save,
    Building2
} from 'lucide-react';
import { createVoyage, getVilles } from '../../api/voyages.api';
import { getAgencies } from '../../api/agencies.api';
import { TRANSPORT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import styles from './VoyageForm.module.css';

function VoyageForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [villesResult, agencesResult] = await Promise.all([
                getVilles({ actif: true }),
                getAgencies({ statut: 'active' })
            ]);
            setVilles(villesResult.data);
            setAgences(agencesResult.data);
        } catch (error) {
            console.error('Erreur chargement données:', error);
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
        if (!formData.ville_depart_id) newErrors.ville_depart_id = 'Sélectionnez la ville de départ';
        if (!formData.ville_arrivee_id) newErrors.ville_arrivee_id = 'Sélectionnez la ville d\'arrivée';
        if (formData.ville_depart_id === formData.ville_arrivee_id && formData.ville_depart_id) {
            newErrors.ville_arrivee_id = 'La ville d\'arrivée doit être différente du départ';
        }
        if (!formData.date_depart) newErrors.date_depart = 'Date de départ requise';
        if (!formData.heure_depart) newErrors.heure_depart = 'Heure de départ requise';
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
            newErrors.prix_unitaire = 'Prix unitaire invalide';
        }
        if (!formData.places_totales || parseInt(formData.places_totales) <= 0) {
            newErrors.places_totales = 'Nombre de places invalide';
        }
        if (!formData.numero_vol_bus.trim()) {
            newErrors.numero_vol_bus = 'Numéro de vol/bus requis';
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
            await createVoyage(voyageData);
            navigate('/voyages');
        } catch (error) {
            console.error('Erreur création voyage:', error);
            setErrors({ submit: 'Une erreur est survenue' });
        } finally {
            setLoading(false);
        }
    };

    // Calcul du résumé
    const prixUnitaire = parseFloat(formData.prix_unitaire) || 0;
    const placesTotales = parseInt(formData.places_totales) || 0;
    const potentielTotal = prixUnitaire * placesTotales;
    const commission = potentielTotal * 0.1; // 10% commission plateforme

    return (
        <div className={styles['voyage-form']}>
            {/* Header */}
            <div className={styles['voyage-form__header']}>
                <Button
                    variant="ghost"
                    icon={ArrowLeft}
                    onClick={() => navigate('/voyages')}
                />
                <h1 className={styles['voyage-form__title']}>Nouveau Voyage</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <Card.Body>
                        {/* Section Agence */}
                        <div className={styles['voyage-form__section']}>
                            <h2 className={styles['voyage-form__section-title']}>
                                <Building2 size={20} style={{ marginRight: '8px' }} />
                                Agence Organisatrice
                            </h2>

                            <div className={styles['voyage-form__field']}>
                                <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                    Agence
                                </label>
                                <select
                                    name="agence_id"
                                    className={`${styles['voyage-form__select']} ${errors.agence_id ? styles['voyage-form__select--error'] : ''}`}
                                    value={formData.agence_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner une agence</option>
                                    {agences.map(agence => (
                                        <option key={agence.id} value={agence.id}>
                                            {agence.nom} - {agence.ville}
                                        </option>
                                    ))}
                                </select>
                                {errors.agence_id && <span className={styles['voyage-form__error']}>{errors.agence_id}</span>}
                            </div>
                        </div>

                        {/* Section Trajet */}
                        <div className={styles['voyage-form__section']}>
                            <h2 className={styles['voyage-form__section-title']}>
                                <MapPin size={20} style={{ marginRight: '8px' }} />
                                Trajet
                            </h2>

                            <div className={styles['voyage-form__route']}>
                                <div className={styles['voyage-form__route-field']}>
                                    <div className={styles['voyage-form__field']}>
                                        <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                            Ville de départ
                                        </label>
                                        <select
                                            name="ville_depart_id"
                                            className={`${styles['voyage-form__select']} ${errors.ville_depart_id ? styles['voyage-form__select--error'] : ''}`}
                                            value={formData.ville_depart_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            {villes.map(ville => (
                                                <option key={ville.id} value={ville.id}>{ville.nom}</option>
                                            ))}
                                        </select>
                                        {errors.ville_depart_id && <span className={styles['voyage-form__error']}>{errors.ville_depart_id}</span>}
                                    </div>
                                </div>

                                <ArrowRight size={24} className={styles['voyage-form__route-arrow']} />

                                <div className={styles['voyage-form__route-field']}>
                                    <div className={styles['voyage-form__field']}>
                                        <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                            Ville d'arrivée
                                        </label>
                                        <select
                                            name="ville_arrivee_id"
                                            className={`${styles['voyage-form__select']} ${errors.ville_arrivee_id ? styles['voyage-form__select--error'] : ''}`}
                                            value={formData.ville_arrivee_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            {villes.map(ville => (
                                                <option key={ville.id} value={ville.id}>{ville.nom}</option>
                                            ))}
                                        </select>
                                        {errors.ville_arrivee_id && <span className={styles['voyage-form__error']}>{errors.ville_arrivee_id}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Type de transport */}
                            <div className={styles['voyage-form__field']}>
                                <label className={styles['voyage-form__label']}>Type de transport</label>
                                <div className={styles['voyage-form__transport-options']}>
                                    <div
                                        className={`${styles['voyage-form__transport-card']} ${formData.type_transport === TRANSPORT_TYPES.BUS ? styles['voyage-form__transport-card--selected'] : ''}`}
                                        onClick={() => handleTransportSelect(TRANSPORT_TYPES.BUS)}
                                    >
                                        <div className={styles['voyage-form__transport-icon']}>
                                            <Bus size={24} />
                                        </div>
                                        <span className={styles['voyage-form__transport-name']}>Bus</span>
                                    </div>
                                    <div
                                        className={`${styles['voyage-form__transport-card']} ${formData.type_transport === TRANSPORT_TYPES.PLANE ? styles['voyage-form__transport-card--selected'] : ''}`}
                                        onClick={() => handleTransportSelect(TRANSPORT_TYPES.PLANE)}
                                    >
                                        <div className={styles['voyage-form__transport-icon']}>
                                            <Plane size={24} />
                                        </div>
                                        <span className={styles['voyage-form__transport-name']}>Avion</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles['voyage-form__row']}>
                                <div className={styles['voyage-form__field']}>
                                    <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                        Numéro de {formData.type_transport === TRANSPORT_TYPES.PLANE ? 'vol' : 'bus'}
                                    </label>
                                    <input
                                        type="text"
                                        name="numero_vol_bus"
                                        className={`${styles['voyage-form__input']} ${errors.numero_vol_bus ? styles['voyage-form__input--error'] : ''}`}
                                        value={formData.numero_vol_bus}
                                        onChange={handleChange}
                                        placeholder={formData.type_transport === TRANSPORT_TYPES.PLANE ? 'AT-201' : 'TE-001'}
                                    />
                                    {errors.numero_vol_bus && <span className={styles['voyage-form__error']}>{errors.numero_vol_bus}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section Horaires */}
                        <div className={styles['voyage-form__section']}>
                            <h2 className={styles['voyage-form__section-title']}>
                                <Calendar size={20} style={{ marginRight: '8px' }} />
                                Horaires
                            </h2>

                            <div className={styles['voyage-form__row']}>
                                <div className={styles['voyage-form__field']}>
                                    <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                        Date de départ
                                    </label>
                                    <input
                                        type="date"
                                        name="date_depart"
                                        className={`${styles['voyage-form__input']} ${errors.date_depart ? styles['voyage-form__input--error'] : ''}`}
                                        value={formData.date_depart}
                                        onChange={handleChange}
                                    />
                                    {errors.date_depart && <span className={styles['voyage-form__error']}>{errors.date_depart}</span>}
                                </div>

                                <div className={styles['voyage-form__field']}>
                                    <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                        Heure de départ
                                    </label>
                                    <input
                                        type="time"
                                        name="heure_depart"
                                        className={`${styles['voyage-form__input']} ${errors.heure_depart ? styles['voyage-form__input--error'] : ''}`}
                                        value={formData.heure_depart}
                                        onChange={handleChange}
                                    />
                                    {errors.heure_depart && <span className={styles['voyage-form__error']}>{errors.heure_depart}</span>}
                                </div>
                            </div>

                            <div className={styles['voyage-form__row']}>
                                <div className={styles['voyage-form__field']}>
                                    <label className={styles['voyage-form__label']}>
                                        Date d'arrivée (estimée)
                                    </label>
                                    <input
                                        type="date"
                                        name="date_arrivee"
                                        className={styles['voyage-form__input']}
                                        value={formData.date_arrivee}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles['voyage-form__field']}>
                                    <label className={styles['voyage-form__label']}>
                                        Heure d'arrivée (estimée)
                                    </label>
                                    <input
                                        type="time"
                                        name="heure_arrivee"
                                        className={styles['voyage-form__input']}
                                        value={formData.heure_arrivee}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Tarification */}
                        <div className={styles['voyage-form__section']}>
                            <h2 className={styles['voyage-form__section-title']}>
                                <DollarSign size={20} style={{ marginRight: '8px' }} />
                                Tarification & Capacité
                            </h2>

                            <div className={styles['voyage-form__row']}>
                                <div className={styles['voyage-form__field']}>
                                    <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                        Prix unitaire (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        name="prix_unitaire"
                                        className={`${styles['voyage-form__input']} ${errors.prix_unitaire ? styles['voyage-form__input--error'] : ''}`}
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        placeholder="15000"
                                        min="0"
                                    />
                                    {errors.prix_unitaire && <span className={styles['voyage-form__error']}>{errors.prix_unitaire}</span>}
                                </div>

                                <div className={styles['voyage-form__field']}>
                                    <label className={`${styles['voyage-form__label']} ${styles['voyage-form__label--required']}`}>
                                        Nombre de places
                                    </label>
                                    <input
                                        type="number"
                                        name="places_totales"
                                        className={`${styles['voyage-form__input']} ${errors.places_totales ? styles['voyage-form__input--error'] : ''}`}
                                        value={formData.places_totales}
                                        onChange={handleChange}
                                        placeholder="50"
                                        min="1"
                                    />
                                    {errors.places_totales && <span className={styles['voyage-form__error']}>{errors.places_totales}</span>}
                                </div>
                            </div>

                            {/* Résumé financier */}
                            {prixUnitaire > 0 && placesTotales > 0 && (
                                <div className={styles['voyage-form__summary']}>
                                    <div className={styles['voyage-form__summary-title']}>
                                        💰 Potentiel de revenus
                                    </div>
                                    <div className={styles['voyage-form__summary-row']}>
                                        <span>Total si complet ({placesTotales} × {formatCurrency(prixUnitaire)})</span>
                                        <span>{formatCurrency(potentielTotal)}</span>
                                    </div>
                                    <div className={styles['voyage-form__summary-row']}>
                                        <span>Commission plateforme (10%)</span>
                                        <span>-{formatCurrency(commission)}</span>
                                    </div>
                                    <div className={`${styles['voyage-form__summary-row']} ${styles['voyage-form__summary-total']}`}>
                                        <span>Revenu net agence</span>
                                        <span>{formatCurrency(potentielTotal - commission)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Description */}
                        <div className={styles['voyage-form__section']}>
                            <div className={styles['voyage-form__field']}>
                                <label className={styles['voyage-form__label']}>
                                    Description (optionnel)
                                </label>
                                <textarea
                                    name="description"
                                    className={styles['voyage-form__textarea']}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Informations supplémentaires sur le voyage..."
                                />
                            </div>
                        </div>

                        {/* Error global */}
                        {errors.submit && (
                            <div style={{ color: 'var(--danger-500)', marginBottom: '16px', textAlign: 'center' }}>
                                {errors.submit}
                            </div>
                        )}

                        {/* Actions */}
                        <div className={styles['voyage-form__actions']}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/voyages')}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                icon={Save}
                                loading={loading}
                            >
                                Créer le voyage
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </form>
        </div>
    );
}

export default VoyageForm;
