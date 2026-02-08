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
        <div className="fade-in">
            <div className={styles.transactionsHeader}>
                <div>
                    <h1 className="page-title">Transactions Financières</h1>
                    <p className="page-subtitle">Historique des paiements et commissions</p>
                </div>
                <button className="btn btn-secondary">
                    <Download size={18} style={{ marginRight: '8px' }} />
                    Exporter
                </button>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.filterControls}>
                    <div className={styles.searchInputContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Rechercher par référence..."
                            className={styles.searchInput}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.filterSelect}
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="">Tous les types</option>
                        <option value="paiement">Paiement</option>
                        <option value="commission">Commission</option>
                        <option value="remboursement">Remboursement</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className="table w-full">
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th className={styles.tableHeaderCell}>Référence</th>
                            <th className={styles.tableHeaderCell}>Date</th>
                            <th className={styles.tableHeaderCell}>Type</th>
                            <th className={styles.tableHeaderCell}>Réservation</th>
                            <th className={styles.tableHeaderCell}>Bénéficiaire</th>
                            <th className={styles.tableHeaderCell}>Montant</th>
                            <th className={styles.tableHeaderCell}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>Chargement des données...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyState}>Aucune transaction trouvée</td>
                            </tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <span className={styles.reference}>{t.reference_paiement}</span>
                                    </td>
                                    <td className={styles.tableCell}>{formatDate(t.created_at)}</td>
                                    <td className={styles.tableCell}>
                                        <Badge variant={t.type_transaction === 'paiement' ? 'info' : 'warning'}>
                                            {getTypeLabel(t.type_transaction)}
                                        </Badge>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <span className={styles.reservationLink}>
                                            {t.reservation_code}
                                        </span>
                                    </td>
                                    <td className={styles.tableCell}>{t.beneficiaire_nom}</td>
                                    <td className={`${styles.tableCell} ${t.type_transaction === 'paiement'
                                            ? styles.amountPositive
                                            : styles.amountNeutral
                                        }`}>
                                        {formatCurrency(t.montant)}
                                    </td>
                                    <td className={styles.tableCell}>
                                        <span className={
                                            t.statut === 'completee'
                                                ? styles.statusCompleted
                                                : styles.statusPending
                                        }>
                                            {t.statut === 'completee' ? 'Complétée' : 'En attente'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsList;
