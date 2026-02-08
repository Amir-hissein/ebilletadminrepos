import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_USERS } from '../../api/demo';
import { ROLE_NAMES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './Login.module.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoLogin = async (user) => {
        setFormData({ email: user.email, password: user.password, remember: false });
        setError('');
        setIsSubmitting(true);

        try {
            await login(user.email, user.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.login__container}>
                {/* Section Branding */}
                <div className={styles.login__branding}>
                    <div className={styles.login__logo}>
                        <span className={styles['login__logo-text']}>ebillet</span>
                    </div>

                    <h1 className={styles.login__tagline}>
                        Plateforme de Billetterie<br />du Tchad
                    </h1>

                    <p className={styles.login__description}>
                        Gérez vos agences de transport, voyages et réservations
                        depuis une interface centralisée et sécurisée.
                    </p>

                    {/* Demo Credentials Panel */}
                    <div className={styles.login__demo}>
                        <div className={styles['login__demo-header']}>
                            <Info size={18} />
                            <span>Mode Démonstration</span>
                        </div>
                        <p className={styles['login__demo-text']}>
                            Cliquez sur un rôle pour vous connecter :
                        </p>
                        <div className={styles['login__demo-users']}>
                            {DEMO_USERS.map(user => (
                                <button
                                    key={user.id}
                                    className={styles['login__demo-btn']}
                                    onClick={() => handleDemoLogin(user)}
                                    disabled={isSubmitting}
                                    type="button"
                                >
                                    {ROLE_NAMES[user.role_id]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section Formulaire */}
                <div className={styles['login__form-section']}>
                    <div className={styles.login__card}>
                        <div className={styles.login__header}>
                            <h2 className={styles.login__title}>Connexion</h2>
                            <p className={styles.login__subtitle}>
                                Accédez à votre espace d'administration
                            </p>
                        </div>

                        <form className={styles.login__form} onSubmit={handleSubmit}>
                            {error && (
                                <div className={styles.login__error}>
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="votre@email.com"
                                icon={Mail}
                                required
                                autoComplete="email"
                            />

                            <Input
                                label="Mot de passe"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                                autoComplete="current-password"
                            />

                            <div className={styles.login__remember}>
                                <label className={styles.login__checkbox}>
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                    />
                                    Se souvenir de moi
                                </label>
                                <a href="/forgot-password" className={styles.login__forgot}>
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={isSubmitting}
                            >
                                Se connecter
                            </Button>
                        </form>

                        <div className={styles.login__footer}>
                            © 2026 E-Billet Tchad. Tous droits réservés.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
