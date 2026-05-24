const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Helper to disable motion if user requests it
const getTransition = (defaults) => {
  if (prefersReduced) {
    return { duration: 0 }
  }
  return defaults
}

export const pageVariants = {
  initial: { opacity: 0, y: prefersReduced ? 0 : 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: getTransition({ duration: 0.4, ease: [0, 0, 0.2, 1] }) 
  },
  exit: { 
    opacity: 0, 
    y: prefersReduced ? 0 : -10, 
    transition: getTransition({ duration: 0.25 }) 
  }
}

export const cardVariants = {
  initial: { opacity: 0, y: prefersReduced ? 0 : 16, scale: prefersReduced ? 1 : 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: getTransition({ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }) 
  }
}

export const staggerContainer = {
  animate: { 
    transition: { staggerChildren: prefersReduced ? 0 : 0.07 } 
  }
}

export const slideUp = {
  initial: { y: '100%' },
  animate: { 
    y: 0, 
    transition: getTransition({ type: 'spring', damping: 28, stiffness: 300 }) 
  },
  exit: { 
    y: '100%', 
    transition: getTransition({ duration: 0.2 }) 
  }
}

export const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: getTransition({ type: 'spring', damping: 18, stiffness: 280 }) 
  }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: getTransition({ duration: 0.3 }) 
  },
  exit: { 
    opacity: 0, 
    transition: getTransition({ duration: 0.2 }) 
  }
}
