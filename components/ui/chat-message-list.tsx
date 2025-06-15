"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, [children])

    return (
      <div ref={ref} className={cn("flex flex-col overflow-y-auto h-full", className)} {...props}>
        <div className="flex-grow">{children}</div>
        <div ref={messagesEndRef} />
      </div>
    )
  },
)

ChatMessageList.displayName = "ChatMessageList"

export { ChatMessageList }

