"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received"
  children: React.ReactNode
}

export function ChatBubble({ className, variant = "received", children, ...props }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-max max-w-[80%] animate-in fade-in slide-in-from-bottom-2 mb-3",
        variant === "sent" ? "ml-auto" : "mr-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  fallback: string
}

export function ChatBubbleAvatar({ className, src, fallback, ...props }: ChatBubbleAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src || "/placeholder.svg"} alt={fallback} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-xs font-medium">{fallback}</span>
      )}
    </div>
  )
}

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received"
  isLoading?: boolean
}

export function ChatBubbleMessage({
  className,
  variant = "received",
  isLoading = false,
  children,
  ...props
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "ml-2 flex flex-col space-y-1 rounded-lg px-3 py-2",
        variant === "sent" ? "bg-[#e4d699] text-black" : "bg-muted",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-1 py-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
        </div>
      ) : typeof children === "string" ? (
        <div
          dangerouslySetInnerHTML={{
            __html: children.replace(
              /\/(menu|booking|order|about|contact)\b/g,
              (match) => `<a href="${match}" class="text-[#e4d699] underline hover:text-[#e4d699]/80">${match}</a>`,
            ),
          }}
        />
      ) : (
        children
      )}
    </div>
  )
}

