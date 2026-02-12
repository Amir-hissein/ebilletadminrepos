import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmer la suppression',
    message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est irréversible.',
    confirmLabel = 'Supprimer',
    cancelLabel = 'Annuler',
    variant = 'danger'
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
            <div
                className={`${styles.modal} ${isOpen ? styles.scaleIn : styles.scaleOut}`}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.close_btn} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.icon_container}>
                    <div className={`${styles.icon_wrapper} ${styles[variant]}`}>
                        <AlertTriangle size={32} />
                    </div>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btn_cancel} onClick={onClose}>
                        {cancelLabel}
                    </button>
                    <button className={`${styles.btn_confirm} ${styles[variant]}`} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
