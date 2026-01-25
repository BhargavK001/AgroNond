import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * AnimatedCounter - Counts from 0 to target value when scrolled into view
 * @param {string|number} value - Target value (can include suffix like 5000+, ₹50L+)
 * @param {number} duration - Animation duration in ms
 */
export default function AnimatedCounter({
  value,
  duration = 2000,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    // Parse the target value
    const valueStr = String(value);
    const numericMatch = valueStr.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplayValue(valueStr);
      return;
    }

    const targetNum = parseFloat(numericMatch[0]);
    const prefix = valueStr.substring(0, valueStr.indexOf(numericMatch[0]));
    const suffix = valueStr.substring(
      valueStr.indexOf(numericMatch[0]) + numericMatch[0].length
    );

    const startTime = Date.now();
    const hasDecimal = numericMatch[0].includes('.');

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNum = targetNum * easeOut;

      if (hasDecimal) {
        setDisplayValue(`${prefix}${currentNum.toFixed(1)}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${Math.floor(currentNum)}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(valueStr);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {displayValue}
    </motion.span>
  );
}
