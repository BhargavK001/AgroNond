import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ShimmerButton - Premium button with shimmer animation effect
 */
export default function ShimmerButton({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) {
  const sizeClasses = {
    sm: 'shimmer-btn-sm',
    md: 'shimmer-btn-md',
    lg: 'shimmer-btn-lg',
  };

  const variantClasses = {
    primary: 'shimmer-btn-primary',
    secondary: 'shimmer-btn-secondary',
    outline: 'shimmer-btn-outline',
  };

  const buttonContent = (
    <motion.span
      className={`shimmer-btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Shimmer overlay */}
      <span className="shimmer-overlay" />

      {/* Glow effect */}
      <span className="shimmer-glow" />

      {/* Button content */}
      <span className="shimmer-content">{children}</span>
    </motion.span>
  );

  if (to) {
    return (
      <Link to={to} className="shimmer-btn-link">
        {buttonContent}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className="shimmer-btn-link">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className="shimmer-btn-link">
      {buttonContent}
    </button>
  );
}

/**
 * MagneticButton - Button with magnetic cursor effect
 */
export function MagneticButton({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`magnetic-wrapper ${className}`}
      whileHover="hover"
      initial="rest"
    >
      <motion.div
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.05 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <ShimmerButton {...props}>{children}</ShimmerButton>
      </motion.div>
    </motion.div>
  );
}
