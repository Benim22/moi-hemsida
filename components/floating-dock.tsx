"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FloatingDockProps {
  items: {
    id: string
    label: string
    disabled?: boolean
  }[]
  activeItem: string
  onItemClick: (id: string) => void
}

export function FloatingDock({ items, activeItem, onItemClick }: FloatingDockProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Check if scrolling controls should be shown
  const checkScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftScroll(scrollLeft > 0)
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5)
  }

  // Scroll to active item
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const activeElement = scrollContainerRef.current.querySelector(`[data-id="${activeItem}"]`) as HTMLElement
    if (activeElement) {
      const containerWidth = scrollContainerRef.current.clientWidth
      const activeElementLeft = activeElement.offsetLeft
      const activeElementWidth = activeElement.offsetWidth

      // Center the active element
      scrollContainerRef.current.scrollTo({
        left: activeElementLeft - containerWidth / 2 + activeElementWidth / 2,
        behavior: "smooth",
      })
    }

    checkScroll()
  }, [activeItem])

  // Set up scroll event listeners
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScrollEvent = () => checkScroll()

    scrollContainer.addEventListener("scroll", handleScrollEvent)
    window.addEventListener("resize", handleScrollEvent)

    // Initial check
    checkScroll()

    return () => {
      scrollContainer.removeEventListener("scroll", handleScrollEvent)
      window.removeEventListener("resize", handleScrollEvent)
    }
  }, [])

  // Scroll left/right functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
  }

  return (
    <div className="flex justify-center mb-12 relative">
      <motion.div
        className="bg-black/40 border border-[#e4d699]/20 rounded-full p-1 md:p-2 shadow-lg backdrop-blur-md relative max-w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Left scroll button */}
        {showLeftScroll && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/80 border border-[#e4d699]/30 rounded-full p-1 z-10 text-[#e4d699] shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right scroll button */}
        {showRightScroll && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-black/80 border border-[#e4d699]/30 rounded-full p-1 z-10 text-[#e4d699] shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center px-2 py-1 gap-1 overflow-x-auto scrollbar-hide max-w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <motion.button
              key={item.id}
              data-id={item.id}
              onClick={() => !item.disabled && onItemClick(item.id)}
              onMouseEnter={() => !item.disabled && setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              disabled={item.disabled}
              className={cn(
                "relative whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors text-sm md:text-base flex-shrink-0",
                item.disabled 
                  ? "text-gray-500 bg-gray-800/50 cursor-not-allowed opacity-50" 
                  : activeItem === item.id 
                    ? "text-black bg-[#e4d699] font-medium" 
                    : "text-[#e4d699] hover:bg-black/50",
              )}
              whileHover={item.disabled ? {} : { scale: 1.05 }}
              whileTap={item.disabled ? {} : { scale: 0.95 }}
            >
              <span className="relative z-10">{item.label}</span>

              {/* Glow effect for active item */}
              {activeItem === item.id && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#e4d699] opacity-20 blur-md"
                  layoutId="activeGlow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Hover indicator */}
              {hoveredItem === item.id && activeItem !== item.id && !item.disabled && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#e4d699]/10"
                  layoutId="hoverIndicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

