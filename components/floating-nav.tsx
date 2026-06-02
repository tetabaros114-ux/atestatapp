'use client'

import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

/**
 * FloatingNav — "Magic Pill" navigation bar
 *
 * A centered, pill-shaped floating nav that sits at the top of the viewport.
 * As the user scrolls, the background becomes more opaque, the border
 * appears, and the shadow grows — giving the impression of the nav
 * "popping out" from the page.
 *
 * Content is provided via children so each page can render its own
 * logo + nav + CTA / badge layout.
 */
export function FloatingNav({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const isScrolled = latest > 24
    if (isScrolled !== scrolled) setScrolled(isScrolled)
  })

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? 'rgba(19, 19, 22, 0.78)' : 'rgba(19, 19, 22, 0.30)',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(140%)',
        borderColor: scrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        boxShadow: scrolled
          ? '0 10px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(16, 185, 129, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
          : '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
        marginTop: scrolled ? 16 : 12,
      }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 rounded-full"
      style={{
        border: '1px solid transparent',
        maxWidth: 'min(72rem, calc(100% - 1.5rem))',
        width: 'fit-content',
      }}
    >
      <div className="flex items-center gap-3 md:gap-6 px-3.5 md:px-5 py-2.5">
        {children}
      </div>
    </motion.header>
  )
}
