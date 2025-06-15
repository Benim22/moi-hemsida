"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedTextProps {
  text: string
  element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  className?: string
  delay?: number
}

export function AnimatedText({ text, element = "p", className = "", delay = 0 }: AnimatedTextProps) {
  const Component = element

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Component className={className}>{text}</Component>
    </motion.div>
  )
}

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = "", delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

