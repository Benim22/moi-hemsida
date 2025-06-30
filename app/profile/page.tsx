"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Settings, ShoppingBag, User, LogOut, Gift } from "lucide-react"
import { RewardCard } from "@/components/reward-card"

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, isAdmin, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [rewardData, setRewardData] = useState({
    currentStamps: 7,
    totalRedeemed: 2,
    canRedeem: false
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
    if (profile?.phone) {
      setPhone(profile.phone)
    }
    if (profile?.address) {
      setAddress(profile.address)
    }
  }, [profile])

  // Handle auth redirect on client side
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/profile")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699]"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Omdirigerar till inloggning...</p>
        </div>
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await updateProfile({ name, phone, address })

      if (error) {
        toast({
          title: "Uppdateringen misslyckades",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profil uppdaterad",
          description: "Din profil har uppdaterats.",
          variant: "success",
        })
      }
    } catch (error) {
      toast({
        title: "Ett fel inträffade",
        description: "Kunde inte uppdatera profilen. Försök igen senare.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="border border-[#e4d699]/20 bg-black/50">
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-[#e4d699]/20 text-[#e4d699] text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{profile.name || "Användare"}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                  {isAdmin && (
                    <div className="mt-2">
                      <span className="bg-[#e4d699]/20 text-[#e4d699] text-xs px-2 py-1 rounded-full">Admin</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className={`w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10 ${
                        activeTab === "profile" ? "bg-[#e4d699]/10 border-[#e4d699]" : ""
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Min profil
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                      onClick={() => router.push("/profile/orders")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Mina beställningar
                    </Button>
                    <Button
                      variant="outline"
                      className={`w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10 relative opacity-60 ${
                        activeTab === "rewards" ? "bg-[#e4d699]/10 border-[#e4d699]" : ""
                      }`}
                      onClick={() => setActiveTab("rewards")}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Belöningar
                      <span className="ml-auto text-xs text-white/60">Kommer snart</span>
                    </Button>
                    <Button
                      variant="outline"
                      className={`w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10 ${
                        activeTab === "cart" ? "bg-[#e4d699]/10 border-[#e4d699]" : ""
                      }`}
                      onClick={() => setActiveTab("cart")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Kundvagn
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                      onClick={() => router.push("/profile/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Inställningar
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                        onClick={() => router.push("/admin")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-500/30 text-red-500 hover:bg-red-500/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logga ut
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="w-full md:w-2/3">
              <Card className="border border-[#e4d699]/20 bg-black/50">
                <CardHeader>
                  <CardTitle>Min profil</CardTitle>
                  <CardDescription>Hantera din profil och inställningar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger
                        value="profile"
                        className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
                      >
                        Profil
                      </TabsTrigger>
                      <TabsTrigger
                        value="rewards"
                        className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black relative opacity-60"
                      >
                        Belöningar
                        <span className="ml-1 text-xs text-white/60">Snart</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="settings"
                        className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
                      >
                        Inställningar
                      </TabsTrigger>
                      <TabsTrigger
                        value="cart"
                        className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
                      >
                        Kundvagn
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Namn</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-[#e4d699]/30 bg-black/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border-[#e4d699]/30 bg-black/50"
                            placeholder="070-123 45 67"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Adress</Label>
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="border-[#e4d699]/30 bg-black/50"
                            placeholder="Gatuadress, Postnummer Stad"
                          />
                          <p className="text-xs text-white/60">Används för automatisk ifyllning vid beställningar.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-post</Label>
                          <Input
                            id="email"
                            value={profile.email}
                            disabled
                            className="border-[#e4d699]/30 bg-black/50 opacity-70"
                          />
                          <p className="text-xs text-white/60">För att ändra e-post, kontakta kundtjänst.</p>
                        </div>
                        <Button
                          type="submit"
                          className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sparar...
                            </>
                          ) : (
                            "Spara ändringar"
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="rewards">
                      <div className="relative">
                        {/* Overlay för att gråa ut innehållet */}
                        <div className="absolute inset-0 bg-black/60 z-10 rounded-lg flex items-center justify-center">
                          <div className="text-center p-8">
                            <Gift className="h-16 w-16 mx-auto mb-4 text-[#e4d699]/60" />
                            <h3 className="text-xl font-medium mb-2 text-white">Kommer snart</h3>
                            <p className="text-white/80 text-sm">
                              Vi arbetar på att lansera vårt belöningssystem. 
                              <br />
                              Håll utkik för uppdateringar!
                            </p>
                          </div>
                        </div>
                        
                        {/* Gråat innehåll i bakgrunden */}
                        <div className="space-y-6 opacity-30 pointer-events-none">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Dina belöningar</h3>
                            <p className="text-white/60 text-sm mb-4">
                              Samla stämplar för varje köp och få fantastiska belöningar!
                            </p>
                          </div>

                          <RewardCard
                            program={{
                              id: 1,
                              name: "Klippkort - Gratis maträtt",
                              description: "Köp 10 rätter och få den 11:e gratis!",
                              requiredStamps: 10,
                              rewardDescription: "Valfri huvudrätt från menyn helt gratis",
                              isActive: true
                            }}
                            userReward={rewardData}
                            onRedeem={() => {}}
                          />

                          {/* Reward History */}
                          <div className="mt-8">
                            <h4 className="text-md font-medium mb-4">Belöningshistorik</h4>
                            <div className="space-y-3">
                              <div className="text-center py-8 text-white/60">
                                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Inga inlösta belöningar än</p>
                                <p className="text-sm">Fortsätt handla för att samla stämplar!</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings">
                      <div className="space-y-4 text-center">
                        <div className="p-8">
                          <Settings className="h-16 w-16 mx-auto mb-4 text-[#e4d699]/60" />
                          <h3 className="text-lg font-medium mb-2">Inställningar</h3>
                          <p className="text-white/60 mb-6">
                            Hantera dina notifikationer, integritet och andra inställningar.
                          </p>
                          <Button 
                            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                            onClick={() => router.push("/profile/settings")}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Öppna inställningar
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="cart">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Sparade varor</h3>
                        <div className="rounded-lg border border-[#e4d699]/20 p-4 text-center">
                          <p className="text-white/60">Du har inga sparade varor i kundvagnen.</p>
                          <Button
                            className="mt-4 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                            onClick={() => router.push("/menu")}
                          >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Utforska menyn
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

