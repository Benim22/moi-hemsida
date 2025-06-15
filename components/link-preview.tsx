"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LinkPreviewProps {
  href: string
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function LinkPreview({ href, icon, className, children }: LinkPreviewProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex items-center justify-center gap-2 rounded-lg border border-[#e4d699]/30 bg-black/30 px-4 py-3 text-[#e4d699] backdrop-blur-sm transition-all hover:bg-[#e4d699]/10",
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span className="text-sm">{children}</span>
      <motion.div
        className="absolute inset-0 rounded-lg border border-[#e4d699]/30"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  )
}

