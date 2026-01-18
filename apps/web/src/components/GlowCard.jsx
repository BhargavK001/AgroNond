import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * GlowCard - Card with animated gradient border and 3D tilt effect
 */
export default function GlowCard({
  children,
  className = '',
  glowColor = 'var(--primary)',
  tiltIntensity = 10,
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTilt({
      x: ((y - centerY) / centerY) * -tiltIntensity,
      y: ((x - centerX) / centerX) * tiltIntensity,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`glow-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Animated gradient border */}
      <div
        className="glow-card-border"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `conic-gradient(from 0deg, ${glowColor}, var(--accent), ${glowColor})`,
        }}
      />

      {/* Inner glow effect */}
      <div
        className="glow-card-glow"
        style={{
          opacity: isHovered ? 0.5 : 0,
          background: `radial-gradient(circle at center, ${glowColor}40, transparent 70%)`,
        }}
      />

      {/* Card content */}
      <div className="glow-card-content">{children}</div>
    </motion.div>
  );
}

/**
 * FeatureGlowCard - Specialized card for feature sections
 */
export function FeatureGlowCard({ icon, title, description, index = 0 }) {
  return (
    <GlowCard className="feature-glow-card">
      <motion.div
        className="feature-icon-wrapper"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {icon}
      </motion.div>
      <h4 className="feature-title">{title}</h4>
      <p className="feature-description">{description}</p>
    </GlowCard>
  );
}
