import styles from './Card.module.css';

function Card({
    children,
    className = '',
    hoverable = false,
    ...props
}) {
    const classes = [
        styles.card,
        hoverable && styles['card--hoverable'],
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle, actions, children }) {
    return (
        <div className={styles.card__header}>
            <div>
                {title && <h3 className={styles.card__title}>{title}</h3>}
                {subtitle && <p className={styles.card__subtitle}>{subtitle}</p>}
                {children}
            </div>
            {actions && <div className={styles.card__actions}>{actions}</div>}
        </div>
    );
}

function CardBody({ children, noPadding = false, className = '' }) {
    const classes = [
        styles.card__body,
        noPadding && styles['card__body--noPadding'],
        className
    ].filter(Boolean).join(' ');

    return <div className={classes}>{children}</div>;
}

function CardFooter({ children, className = '' }) {
    return (
        <div className={`${styles.card__footer} ${className}`}>
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
