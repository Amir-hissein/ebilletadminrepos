import styles from './Button.module.css';

function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
}) {
    const classes = [
        styles.button,
        styles[`button--${variant}`],
        size !== 'md' && styles[`button--${size}`],
        fullWidth && styles['button--full'],
        Icon && !children && styles['button--icon'],
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className={styles.button__spinner} />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={16} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={16} />}
                </>
            )}
        </button>
    );
}

export default Button;
