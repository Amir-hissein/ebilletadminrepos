import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Input.module.css';

const Input = forwardRef(({
    label,
    type = 'text',
    error,
    hint,
    icon: Icon,
    suffix,
    required = false,
    className = '',
    ...props
}, ref) => {
    const inputClasses = [
        styles.input,
        error && styles['input--error'],
        Icon && styles['input--withIcon'],
        suffix && styles['input--withSuffix'],
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={styles['input-wrapper']}>
            {label && (
                <label className={`${styles.label} ${required ? styles['label--required'] : ''}`}>
                    {label}
                </label>
            )}

            <div className={styles['input-container']}>
                {Icon && <Icon size={18} className={styles.icon} />}

                <input
                    ref={ref}
                    type={type}
                    className={inputClasses}
                    aria-invalid={!!error}
                    {...props}
                />

                {suffix && <span className={styles.suffix}>{suffix}</span>}
            </div>

            {error && (
                <span className={styles['error-message']}>
                    <AlertCircle size={14} />
                    {error}
                </span>
            )}

            {hint && !error && (
                <span className={styles.hint}>{hint}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(({
    label,
    error,
    hint,
    required = false,
    className = '',
    rows = 4,
    ...props
}, ref) => {
    const textareaClasses = [
        styles.input,
        styles.textarea,
        error && styles['input--error'],
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={styles['input-wrapper']}>
            {label && (
                <label className={`${styles.label} ${required ? styles['label--required'] : ''}`}>
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                className={textareaClasses}
                rows={rows}
                aria-invalid={!!error}
                {...props}
            />

            {error && (
                <span className={styles['error-message']}>
                    <AlertCircle size={14} />
                    {error}
                </span>
            )}

            {hint && !error && (
                <span className={styles.hint}>{hint}</span>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

// Select variant
export const Select = forwardRef(({
    label,
    error,
    hint,
    required = false,
    options = [],
    placeholder = 'Sélectionner...',
    className = '',
    ...props
}, ref) => {
    const selectClasses = [
        styles.input,
        styles.select,
        error && styles['input--error'],
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={styles['input-wrapper']}>
            {label && (
                <label className={`${styles.label} ${required ? styles['label--required'] : ''}`}>
                    {label}
                </label>
            )}

            <select
                ref={ref}
                className={selectClasses}
                aria-invalid={!!error}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <span className={styles['error-message']}>
                    <AlertCircle size={14} />
                    {error}
                </span>
            )}

            {hint && !error && (
                <span className={styles.hint}>{hint}</span>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Input;
