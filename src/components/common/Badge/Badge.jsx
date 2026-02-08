import styles from './Badge.module.css';

function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = ''
}) {
    const classes = [
        styles.badge,
        styles[`badge--${variant}`],
        styles[`badge--${size}`],
        dot && styles['badge--dot'],
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {dot && <span className={styles.badge__dot} />}
            {children}
        </span>
    );
}

export default Badge;
