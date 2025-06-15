"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(({ className, ...props }, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const form = event.currentTarget.form
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }
  }

  return (
    <textarea
      ref={ref}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full resize-none border-0 bg-transparent p-0 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
})

ChatInput.displayName = "ChatInput"

export { ChatInput }

