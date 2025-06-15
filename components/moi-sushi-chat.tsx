"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Send, Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

// Definiera meddelandetypen
interface Message {
  id: number
  content: string
  sender: "user" | "ai"
}

export function MoiSushiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hej! Jag är Moi Sushi-assistenten. Jag kan hjälpa dig med information om vår meny, öppettider, bokning och beställning. Du kan också fråga mig om hur du navigerar på vår hemsida.",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatPosition, setChatPosition] = useState<"bottom-right" | "bottom-left">("bottom-right")
  const [isOpen, setIsOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set chat position based on screen size
  useEffect(() => {
    const handleResize = () => {
      setChatPosition("bottom-right") // Always position on bottom-right
    }

    // Set initial position
    handleResize()

    // Update on resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Lägg till användarens meddelande
    const userMessage = input.trim()
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: userMessage,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    try {
      // Anropa Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Lägg till AI:s svar
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.response,
          sender: "ai",
        },
      ])
    } catch (error) {
      console.error("Error fetching AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content:
            "Jag kunde tyvärr inte besvara din fråga just nu. Vänligen försök igen senare eller kontakta oss direkt på 0410-28110.",
          sender: "ai",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format AI responses with navigation links
  const formatResponseWithLinks = (text: string) => {
    // Pattern to match potential page references like "/menu" or "/booking"
    const pagePathPattern = /\/(menu|booking|order|about|contact)\b/g

    // Replace page paths with links
    const formattedText = text.replace(pagePathPattern, (match) => {
      const pageName = match.substring(1) // Remove the leading slash
      let pageTitle = ""

      // Map paths to readable titles
      switch (pageName) {
        case "menu":
          pageTitle = "menysidan"
          break
        case "booking":
          pageTitle = "bokningssidan"
          break
        case "order":
          pageTitle = "beställningssidan"
          break
        case "about":
          pageTitle = "Om Oss-sidan"
          break
        case "contact":
          pageTitle = "kontaktsidan"
          break
        default:
          pageTitle = pageName
      }

      return `<a href="${match}" class="text-[#e4d699] underline hover:text-[#e4d699]/80">${pageTitle}</a>`
    })

    return formattedText
  }

  return (
    <ExpandableChat size="md" position={chatPosition} icon={<Bot className="h-6 w-6" />} onOpenChange={setIsOpen}>
      <div className="flex flex-col h-full">
        <ExpandableChatHeader className="flex items-center justify-between bg-[#e4d699]/10 z-10 flex-shrink-0">
          <div className="flex items-center">
            <img
              src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
              alt="Moi Sushi Logo"
              className="h-8 w-auto mr-2"
            />
            <div>
              <h1 className="text-lg font-semibold">Moi Sushi Assistent</h1>
              <p className="text-xs text-muted-foreground">Fråga mig om vår meny, öppettider eller annat</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </ExpandableChatHeader>

        <ExpandableChatBody className="bg-black/90 flex-1 overflow-y-auto mt-2">
          <ChatMessageList className="px-4 pt-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} variant={message.sender === "user" ? "sent" : "received"}>
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user"
                      ? "/placeholder.svg?height=32&width=32"
                      : "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
                  }
                  fallback={message.sender === "user" ? "Du" : "MS"}
                />
                <ChatBubbleMessage variant={message.sender === "user" ? "sent" : "received"}>
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
                  fallback="MS"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}

            <div ref={messagesEndRef} />
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter className="bg-black/90 border-t border-[#e4d699]/20 flex-shrink-0">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ditt meddelande..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <Button type="submit" size="sm" className="ml-auto gap-1.5 bg-[#e4d699] text-black hover:bg-[#e4d699]/90">
                Skicka
                <Send className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </div>
    </ExpandableChat>
  )
}

