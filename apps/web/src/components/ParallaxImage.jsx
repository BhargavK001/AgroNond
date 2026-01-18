import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ParallaxImage - Image with parallax scroll effect
 * @param {string} src - Image source
 * @param {string} alt - Image alt text
 * @param {number} speed - Parallax speed (0.1 = slow, 0.5 = fast)
 * @param {string} direction - 'up' or 'down'
 */
export default function ParallaxImage({
  src,
  alt,
  speed = 0.2,
  direction = 'up',
  className = '',
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);

  return (
    <div ref={ref} className={`parallax-image-container ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="parallax-image"
      />
    </div>
  );
}

/**
 * ParallaxSection - Section with parallax background
 */
export function ParallaxSection({ children, speed = 0.3, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <motion.section
      ref={ref}
      className={`parallax-section ${className}`}
      style={{ opacity }}
    >
      <motion.div className="parallax-bg" style={{ y }} />
      <div className="parallax-content">{children}</div>
    </motion.section>
  );
}

/**
 * FloatingElement - Element that floats with slight parallax
 */
export function FloatingElement({
  children,
  speed = 0.15,
  delay = 0,
  className = '',
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50 * speed, -50 * speed]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <motion.div
      ref={ref}
      className={`floating-element ${className}`}
      style={{ y, rotate }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
