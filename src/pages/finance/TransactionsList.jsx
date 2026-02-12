import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { getTransactions } from '../../api/finance.api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import styles from './Finance.module.css';

const TransactionsList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        statut: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getTransactions(filters);
            setTransactions(result.data);
        } catch (error) {
            console.error('Erreur chargement transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'paiement': return 'Paiement';
            case 'commission': return 'Commission';
            case 'remboursement': return 'Remboursement';
            default: return type;
        }
    };

    return (
        <div className={styles.enterprise_container}>
            <header className={styles.finance_header_pro}>
                <div className={styles.header_main}>
                    <div className={styles.greeting_row}>
                        <h1>Transactions Historiques</h1>
                        <div className={styles.status_badge_compact}>
                            <span className={styles.status_dot}></span>
                            <span className={styles.status_text}>Système d'Audit Actif</span>
                        </div>
                    </div>
                    <span className={styles.date_display}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div className={styles.global_actions}>
                    <button className={styles.btn_primary_outline} onClick={() => alert('Export CSV...')}>
                        <Download size={16} />
                        <span>Exporter CSV</span>
                    </button>
                </div>
            </header>

            <div className={styles.transactions_filters_pro}>
                <div className={styles.search_group_pro}>
                    <Search size={18} className={styles.search_icon_pro} />
                    <input
                        type="text"
                        placeholder="Rechercher une référence ou un code..."
                        className={styles.search_input_pro}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className={styles.filter_group_pro}>
                    <select
                        className={styles.select_compact}
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="paiement">Paiement Client</option>
                        <option value="commission">Commission Agence</option>
                        <option value="remboursement">Remboursement</option>
                    </select>
                </div>
            </div>

            <div className={styles.audit_table_panel_pro}>
                <div className={styles.table_scroll_viewport_pro}>
                    <table className={styles.audit_table_pro}>
                        <thead>
                            <tr>
                                <th>Référence Audit</th>
                                <th>Date & Heure</th>
                                <th>Type Flux</th>
                                <th>Code Résa</th>
                                <th>Bénéficiaire</th>
                                <th>Montant Net</th>
                                <th>Statut Audit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>Chargement des données...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className={styles.empty_state_container_pro}>
                                            <div className={styles.empty_state_icon_pro}>
                                                <Search size={40} />
                                            </div>
                                            <h3>Aucun résultat trouvé</h3>
                                            <p>Nous n'avons trouvé aucune transaction correspondant à "<strong>{filters.search}</strong>".</p>
                                            <button
                                                className={styles.reset_filters_btn_pro}
                                                onClick={() => setFilters({ search: '', type: '', statut: '' })}
                                            >
                                                Réinitialiser les filtres
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td className={styles.mono_text}>{t.reference_paiement}</td>
                                        <td className={styles.mono_text}>{formatDate(t.created_at)}</td>
                                        <td>
                                            <Badge variant={t.type_transaction === 'paiement' ? 'info' : 'warning'}>
                                                {getTypeLabel(t.type_transaction)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className={styles.reservation_code_badge}>
                                                {t.reservation_code}
                                            </span>
                                        </td>
                                        <td className={styles.beneficiary_cell}>{t.beneficiaire_nom}</td>
                                        <td className={styles.amount_cell_pro}>
                                            {formatCurrency(t.montant)}
                                        </td>
                                        <td>
                                            <div className={t.statut === 'completee' ? styles.status_pill_success : styles.status_pill_pending}>
                                                {t.statut === 'completee' ? 'Complétée' : 'Audit en cours'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionsList;
