"use client"

import type React from "react"
import { useRef, useState } from "react"
import { X, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ChatPosition = "bottom-right" | "bottom-left"
export type ChatSize = "sm" | "md" | "lg" | "xl" | "full"

const chatConfig = {
  dimensions: {
    sm: "sm:max-w-sm sm:max-h-[500px]",
    md: "sm:max-w-md sm:max-h-[600px]",
    lg: "sm:max-w-lg sm:max-h-[700px]",
    xl: "sm:max-w-xl sm:max-h-[800px]",
    full: "sm:w-full sm:h-full",
  },
  positions: {
    "bottom-right": "bottom-24 md:bottom-30 right-5", // Updated to be higher to avoid footer
    "bottom-left": "bottom-24 md:bottom-30 left-5", // Updated to be higher to avoid footer
  },
  chatPositions: {
    "bottom-right": "sm:bottom-[calc(100%+10px)] sm:right-0",
    "bottom-left": "sm:bottom-[calc(100%+10px)] sm:left-0",
  },
  states: {
    open: "pointer-events-auto opacity-100 visible scale-100 translate-y-0",
    closed: "pointer-events-none opacity-0 invisible scale-100 sm:translate-y-5",
  },
}

interface ExpandableChatProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: ChatPosition
  size?: ChatSize
  icon?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

const ExpandableChat: React.FC<ExpandableChatProps> = ({
  className,
  position = "bottom-right",
  size = "md",
  icon,
  children,
  onOpenChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  const closeChat = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  // Close chat when clicking outside in mobile view
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeChat()
  }

  return (
    <div className={cn(`fixed ${chatConfig.positions[position]} z-50`, className)} {...props}>
      {/* Backdrop - visible when chat is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleBackdropClick} aria-hidden="true" />
      )}

      <div
        ref={chatRef}
        className={cn(
          "flex flex-col bg-background border sm:rounded-lg shadow-md overflow-hidden transition-all duration-250 ease-out sm:absolute sm:w-[90vw] sm:h-[80vh] fixed inset-0 w-full h-full sm:inset-auto max-h-[80vh] h-[600px] z-50",
          chatConfig.chatPositions[position],
          chatConfig.dimensions[size],
          isOpen ? chatConfig.states.open : chatConfig.states.closed,
          className,
        )}
      >
        {children}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-20 text-white/60 hover:text-white hover:bg-white/10" 
          onClick={closeChat}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ExpandableChatToggle icon={icon} isOpen={isOpen} toggleChat={toggleChat} />
    </div>
  )
}

ExpandableChat.displayName = "ExpandableChat"

const ExpandableChatHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-4 border-b", className)} {...props} />
)

ExpandableChatHeader.displayName = "ExpandableChatHeader"

const ExpandableChatBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex-1 overflow-y-auto", className)} {...props} />
)

ExpandableChatBody.displayName = "ExpandableChatBody"

const ExpandableChatFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("border-t p-4", className)} {...props} />
)

ExpandableChatFooter.displayName = "ExpandableChatFooter"

interface ExpandableChatToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  isOpen: boolean
  toggleChat: () => void
}

const ExpandableChatToggle: React.FC<ExpandableChatToggleProps> = ({
  className,
  icon,
  isOpen,
  toggleChat,
  ...props
}) => (
  <Button
    variant="default"
    onClick={toggleChat}
    className={cn(
      "w-14 h-14 rounded-full shadow-md flex items-center justify-center hover:shadow-lg hover:shadow-black/30 transition-all duration-300 bg-[#e4d699] text-black hover:bg-[#e4d699]/90",
      className,
    )}
    {...props}
  >
    {isOpen ? <X className="h-6 w-6" /> : icon || <MessageCircle className="h-6 w-6" />}
  </Button>
)

ExpandableChatToggle.displayName = "ExpandableChatToggle"

export { ExpandableChat, ExpandableChatHeader, ExpandableChatBody, ExpandableChatFooter }

