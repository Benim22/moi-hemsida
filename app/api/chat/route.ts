import { type NextRequest, NextResponse } from "next/server"
import { generateGeminiResponse } from "@/lib/gemini-service"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check if the message contains navigation intent
    const navigationKeywords = [
      { keywords: ["meny", "mat", "rätter", "sushi", "pokebowl"], path: "/menu" },
      { keywords: ["boka", "bokning", "reservera", "bord"], path: "/booking" },
      { keywords: ["beställ", "beställning", "leverans", "avhämtning"], path: "/order" },
      { keywords: ["om", "historia", "team"], path: "/about" },
      { keywords: ["kontakt", "hitta", "adress", "telefon", "mail"], path: "/contact" },
    ]

    let navigationSuggestion = ""
    const lowerCaseMessage = message.toLowerCase()

    for (const nav of navigationKeywords) {
      if (nav.keywords.some((keyword) => lowerCaseMessage.includes(keyword))) {
        navigationSuggestion = nav.path
        break
      }
    }

    const response = await generateGeminiResponse(message)

    // If navigation intent was detected, enhance the response
    let enhancedResponse = response
    if (navigationSuggestion) {
      if (!response.includes(navigationSuggestion)) {
        enhancedResponse = `${response}\n\nDu kan hitta mer information om detta på vår ${navigationSuggestion} sida.`
      }
    }

    return NextResponse.json({ response: enhancedResponse })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

