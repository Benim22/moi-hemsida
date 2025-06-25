"use client"

import { useState, type FormEvent } from "react"
import { Send, Bug, X, AlertTriangle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export function BugReportFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "feedback", // feedback, bug, suggestion
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      toast({
        title: "Meddelande saknas",
        description: "Vänligen skriv ditt meddelande innan du skickar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Skicka feedback till API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kunde inte skicka meddelandet')
      }

      toast({
        title: "Tack för din feedback!",
        description: "Ditt meddelande har skickats. Vi uppskattar verkligen din feedback och kommer att granska den.",
      })

      // Rensa formuläret
      setFormData({
        type: "feedback",
        name: "",
        email: "",
        message: "",
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Kunde inte skicka meddelandet",
        description: "Något gick fel. Försök igen eller kontakta oss direkt på 0410-281 10.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type }))
  }

  return (
    <ExpandableChat 
      size="md" 
      position="bottom-right" 
      icon={<MessageSquare className="h-6 w-6" />} 
      onOpenChange={setIsOpen}
    >
      <div className="flex flex-col h-full">
        <ExpandableChatHeader className="flex items-center justify-between bg-[#e4d699]/10 z-10 flex-shrink-0">
          <div className="flex items-center">
            <img
              src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
              alt="Moi Sushi Logo"
              className="h-8 w-auto mr-2"
            />
            <div>
              <h1 className="text-lg font-semibold">Feedback & Buggrapporter</h1>
              <p className="text-xs text-muted-foreground">Hjälp oss förbättra hemsidan</p>
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

        <ExpandableChatBody className="bg-black/90 flex-1 overflow-y-auto p-4">
          <Card className="bg-transparent border-[#e4d699]/20 mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg text-white">Ny hemsida - Vi uppskattar din feedback!</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Vår hemsida är helt ny och vi arbetar ständigt med att förbättra den. 
                Om du stöter på några problem, har förslag på förbättringar eller bara vill ge oss feedback, 
                är vi här för att lyssna. Vi är redo att hantera alla rapporter och kommer att åtgärda 
                eventuella problem så snabbt som möjligt.
              </CardDescription>
            </CardHeader>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant={formData.type === "feedback" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTypeChange("feedback")}
              >
                💬 Feedback
              </Badge>
              <Badge
                variant={formData.type === "bug" ? "destructive" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTypeChange("bug")}
              >
                🐛 Buggrapport
              </Badge>
              <Badge
                variant={formData.type === "suggestion" ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTypeChange("suggestion")}
              >
                💡 Förslag
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Namn (valfritt)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ditt namn..."
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-post (valfritt)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="din@email.com"
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-white">
                {formData.type === "bug" ? "Beskriv problemet" : 
                 formData.type === "suggestion" ? "Ditt förslag" : "Din feedback"}
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={
                  formData.type === "bug" ? "Beskriv vad som hände och hur vi kan återskapa problemet..." :
                  formData.type === "suggestion" ? "Vad skulle du vilja se förbättrat eller lagt till..." :
                  "Dela dina tankar om hemsidan..."
                }
                className="bg-gray-900/50 border-gray-700 text-white min-h-[100px]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Skickar..." : "Skicka meddelande"}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Tips:</strong> Du kan också kontakta oss direkt på telefon 0410-281 10 
              eller via våra sociala medier för snabb hjälp.
            </p>
          </div>
        </ExpandableChatBody>
      </div>
    </ExpandableChat>
  )
} 