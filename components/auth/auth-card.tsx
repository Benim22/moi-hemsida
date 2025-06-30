"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { Loader2 } from "lucide-react"

// Update the AuthCard component to handle redirects
// Add this to the props interface

interface AuthCardProps {
  mode: "signin" | "signup"
  onSuccess?: () => void
}

export function AuthCard({ mode, onSuccess }: AuthCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(mode === "signup" ? "register" : "login")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")

  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(loginEmail, loginPassword)

      if (error) {
        toast({
          title: "Inloggningen misslyckades",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Inloggad!",
          description: "Du är nu inloggad.",
          variant: "success",
        })
        router.push("/")
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      toast({
        title: "Ett fel inträffade",
        description: "Kunde inte logga in. Försök igen senare.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Lösenorden matchar inte",
        description: "Vänligen kontrollera att lösenorden matchar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(registerEmail, registerPassword, registerName)

      if (error) {
        toast({
          title: "Registreringen misslyckades",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registrering lyckades!",
          description: "Kontrollera din e-post för att verifiera ditt konto.",
          variant: "success",
        })
        setActiveTab("login")
      }
    } catch (error) {
      toast({
        title: "Ett fel inträffade",
        description: "Kunde inte registrera. Försök igen senare.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <Card className="w-full max-w-md mx-auto border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Välkommen till Moi Sushi</CardTitle>
        <CardDescription className="text-center">Logga in eller skapa ett konto för att fortsätta</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black">
              Logga in
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black">
              Registrera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Lösenord</Label>
                  <Button variant="link" className="text-xs text-[#e4d699] px-0" asChild>
                    <a href="/auth/forgot-password">Glömt lösenord?</a>
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loggar in...
                  </>
                ) : (
                  "Logga in"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  placeholder="Ditt namn"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">E-post</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="din@email.se"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Lösenord</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bekräfta lösenord</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrerar...
                  </>
                ) : (
                  "Registrera"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>


      </CardContent>
      <CardFooter className="flex justify-center text-sm text-white/60">
        Genom att fortsätta godkänner du våra användarvillkor och integritetspolicy.
      </CardFooter>
    </Card>
  )
}

