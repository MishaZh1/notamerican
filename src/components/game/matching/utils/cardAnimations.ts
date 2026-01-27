import { Variants } from "framer-motion"

// =============================================================================
// CARD ANIMATION VARIANTS
// =============================================================================

export const cardVariants: Variants = {
    IDLE: {
        scale: 1,
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    SELECTED: {
        scale: 1.05,
        opacity: 1,
        y: -4,
        transition: { type: "spring", stiffness: 500, damping: 30 }
    },
    MATCHED: {
        scale: 1.05,
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    },
    WRONG: {
        x: [0, -10, 10, -10, 10, 0], // Shake effect, returns to 0
        y: 0,
        scale: 1,
        opacity: 1, // Force opacity
        transition: { duration: 0.4 }
    },
    DISAPPEARING: {
        opacity: 0.15, // Subtle shadow/frame remains visible
        scale: 0.95,
        y: 0,
        transition: { duration: 2, ease: "easeInOut" } // Slow 2s fade
    },
    APPEARING: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 15 } // Bouncy pop-in
    },
    HIDDEN: {
        opacity: 0,
        scale: 0,
        y: 20
    }
}
