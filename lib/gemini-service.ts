"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Configure Google Gemini API with environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")
console.log("Gemini API initialized with key:", process.env.GOOGLE_GEMINI_API_KEY ? "Key exists" : "No key found")

// Context about Moi Sushi that we give to the AI
const MOI_SUSHI_CONTEXT = `
Moi Sushi & Poké Bowl är en sushirestaurang i Trelleborg. Här är information om restaurangen:

Adress: Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg
Telefon: 0410-281 10
E-post: moisushi@outlook.com

Öppettider:
- Måndag–Fredag: 11.00 – 21.00
- Lördag: 12.00 – 21.00
- Söndag: 15.00 – 21.00

Moi Sushi erbjuder ett brett utbud av sushi, pokébowls och andra japanska rätter. Populära rätter inkluderar:
- California Roll
- Salmon Roll
- Crazy Salmon
- Magic Lax Pokébowl
- Spicy Beef Pokébowl

Restaurangen erbjuder både avhämtning och leverans via Foodora, Uber Eats och Wolt.
Man kan också boka bord via telefon eller på hemsidan.

Moi Sushi har även en Food Truck i Ystad som erbjuder pokébowls.
En ny restaurang i Malmö kommer att öppna inom kort.

Restaurangen lägger stor vikt vid färska råvaror och autentiska smaker.

VIKTIG INFORMATION OM HEMSIDAN:
Du är en AI-assistent som befinner dig på Moi Sushi & Poké Bowls officiella hemsida. Hemsidan har följande struktur och sidor:

1. Startsida (/) - Huvudsidan med översikt och nyheter
2. Meny (/menu) - Komplett meny med alla rätter, inklusive sushi, pokébowls och drycker
3. Boka Bord (/booking) - Sida för att boka bord på restaurangen
4. Beställ Online (/order) - Sida för att beställa mat för avhämtning eller leverans
5. Om Oss (/about) - Information om restaurangens historia och team
6. Kontakt (/contact) - Kontaktinformation och formulär

När användare frågar om något som finns på en specifik sida, berätta för dem vilken sida informationen finns på och föreslå att de kan besöka den sidan. Till exempel:
- Om någon frågar om menyn, berätta att de kan se hela menyn på menysidan (/menu)
- Om någon vill boka bord, hänvisa dem till bokningssidan (/booking)
- Om någon vill beställa mat, hänvisa dem till beställningssidan (/order)

Använd gärna formuleringar som "Du kan besöka vår [sidnamn] genom att klicka på länken i navigeringen" eller "På vår [sidnamn] kan du hitta mer information om detta".
`

export async function generateGeminiResponse(userMessage: string) {
  try {
    // Create a new chat session
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // If the above doesn't work, try this alternative:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" })

    // Create a chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Här är information om Moi Sushi som du ska använda för att svara på frågor:" }],
        },
        {
          role: "model",
          parts: [
            { text: "Jag förstår. Jag kommer att använda denna information för att svara på frågor om Moi Sushi." },
          ],
        },
        {
          role: "user",
          parts: [{ text: MOI_SUSHI_CONTEXT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Tack för informationen om Moi Sushi & Poké Bowl. Jag kommer att använda dessa detaljer för att svara på frågor om restaurangen, deras meny, öppettider, platser och tjänster. Hur kan jag hjälpa dig idag?",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    // Send the user's message and get a response
    const result = await chat.sendMessage(userMessage)
    const response = result.response.text()

    return response
  } catch (error) {
    console.error("Error generating Gemini response:", error)
    return "Jag kunde tyvärr inte besvara din fråga just nu. Vänligen försök igen senare eller kontakta oss direkt på 0410-281 10."
  }
}

