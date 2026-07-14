/** Central motion token registry — import these instead of hardcoding durations/easings */
export const motionTokens = {
  // Durations in seconds (Framer Motion uses seconds)
  durations: {
    fast:   0.09,
    hover:  0.14,
    medium: 0.20,
    page:   0.25,
    slow:   0.35,
  },

  easings: {
    inOut:  'easeInOut',
    out:    'easeOut',
    spring: { type: 'spring', stiffness: 400, damping: 30 },

    // Smooth crossfade for hero slides — slow, intentional
    heroFade: {
      type: 'tween' as const,
      ease: 'easeInOut',
      duration: 0.7,
    },

    // Calm spring for sheets and overlays — wellness feel, not bouncy
    calmSpring: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 30,
    },
  },

  // Pre-composed spring config (retained for backward-compat)
  spring: { type: 'spring', stiffness: 400, damping: 30 },
} as const;
