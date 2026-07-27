import { motion } from 'framer-motion';
import { motionTokens } from '../../design/motion';

// Palette sampled directly from public/logo/wordmark.png (the flattened source
// logo) and reconciled with the PWA theme color in public/manifest.json so the
// two never drift apart.
const NAVY = '#002858';
const RED = '#D30300';
const YELLOW = '#F5D000';
const GREEN = '#00B84D';
const CYAN = '#17A2B8';

const letterFont = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontWeight: 800,
} as const;

/**
 * Hand-built SVG recreation of the ED Retail wordmark (the shipped asset is a
 * single flattened PNG with no separable layers). Every element below is an
 * independent motion node so the splash sequence can stage them individually:
 * E + D lock in, "Retail" wipes on, then the cart flies in on the speed
 * trails and settles like it's hanging off the 't'.
 */
export function EDRetailAnimatedLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 190" className={className} role="img" aria-label="ED Retail">
      <defs>
        <clipPath id="retailReveal">
          <motion.rect
            x="200"
            y="40"
            height="70"
            initial={{ width: 0 }}
            animate={{ width: 150 }}
            transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.4 }}
          />
        </clipPath>
        <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* E — slides in from the left with a slight overshoot */}
      <motion.text
        x="4"
        y="105"
        fontSize="112"
        letterSpacing="-3"
        fill={NAVY}
        style={letterFont}
        initial={{ opacity: 0, x: -50, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        E
      </motion.text>

      {/* D — drops in and locks the ED block into place */}
      <motion.text
        x="98"
        y="105"
        fontSize="112"
        letterSpacing="-3"
        fill={RED}
        style={letterFont}
        initial={{ opacity: 0, y: -45, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...motionTokens.easings.calmSpring, delay: 0.15 }}
      >
        D
      </motion.text>

      {/* Retail — wipes on left-to-right from behind the D */}
      <g clipPath="url(#retailReveal)">
        <text x="204" y="97" fontSize="52" letterSpacing="-1" fill={NAVY} fontFamily="Arial, sans-serif" fontWeight={600}>
          Retail
        </text>
      </g>

      {/* Speed trails — dash in just ahead of the cart */}
      <motion.path
        d="M144,150 Q170,140 200,131"
        stroke={YELLOW}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.82 }}
      />
      <motion.path
        d="M138,161 Q166,151 202,141"
        stroke={GREEN}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.88 }}
      />
      <motion.path
        d="M132,172 Q162,162 204,151"
        stroke={CYAN}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.94 }}
      />

      {/* Cart — zips in on the trails, hangs off the 't' hook, settles like a pendulum */}
      <motion.g
        transform="translate(232,96)"
        style={{ originX: 0.5, originY: 0 }}
        initial={{ opacity: 0, x: -70, y: -10, scale: 0.6 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: [0, -16, 11, -6, 3, 0] }}
        transition={{
          opacity: { duration: 0.3, delay: 0.85 },
          x: { duration: 0.35, delay: 0.85, ease: 'easeOut' },
          y: { duration: 0.35, delay: 0.85, ease: 'easeOut' },
          scale: { duration: 0.35, delay: 0.85, ease: 'easeOut' },
          rotate: { duration: 0.65, delay: 1.2, times: [0, 0.22, 0.46, 0.68, 0.86, 1], ease: 'easeOut' },
        }}
      >
        {/* handle hooking up toward the 't' crossbar */}
        <path d="M4,0 L12,0 L18,30 L74,30" stroke={RED} strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* basket */}
        <path d="M18,30 L78,30 L71,58 L25,58 Z" fill={RED} />
        <line x1="34" y1="30" x2="30" y2="58" stroke="#8f0000" strokeWidth="2" />
        <line x1="48" y1="30" x2="47" y2="58" stroke="#8f0000" strokeWidth="2" />
        <line x1="62" y1="30" x2="65" y2="58" stroke="#8f0000" strokeWidth="2" />
        {/* wheels */}
        <circle cx="32" cy="70" r="7" fill={NAVY} />
        <circle cx="64" cy="70" r="7" fill={NAVY} />
      </motion.g>

      {/* shimmer sweep once assembly completes */}
      <motion.rect
        x="-60"
        y="0"
        width="50"
        height="190"
        fill="url(#shimmerGrad)"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 400, opacity: [0, 1, 0] }}
        transition={{ duration: 0.6, delay: 1.55, ease: 'easeInOut' }}
      />
    </svg>
  );
}
