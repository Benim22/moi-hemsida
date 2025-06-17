"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Trash2, 
  Save,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react"

export default function SettingsPage() {
  const { user, profile, updateProfile, updatePreferences, signOut, loading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      })
      
      // Load preferences from profile
      if (profile.preferences) {
        setNotifications(profile.preferences.notifications)
        setPrivacy(profile.preferences.privacy)
      }
    }
  }, [profile])

  // Handle auth redirect on client side
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/profile/settings")
    }
  }, [loading, user, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      })

      if (result.error) {
        toast({
          title: "Fel",
          description: "Kunde inte spara ändringar. Försök igen.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sparat!",
          description: "Dina inställningar har uppdaterats.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Fel",
        description: "Ett oväntat fel inträffade.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    try {
      const preferences = {
        notifications,
        privacy
      }
      
      const result = await updatePreferences(preferences)

      if (result.error) {
        toast({
          title: "Fel",
          description: "Kunde inte spara preferenser. Försök igen.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sparat!",
          description: "Dina preferenser har uppdaterats.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Fel",
        description: "Ett oväntat fel inträffade vid sparande av preferenser.",
        variant: "destructive",
      })
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const handleDeleteAccount = async () => {
    // This would need to be implemented with proper backend support
    toast({
      title: "Funktion inte tillgänglig",
      description: "Kontakta support för att ta bort ditt konto.",
      variant: "destructive",
    })
    setShowDeleteConfirm(false)
  }

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

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till profil
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Inställningar</h1>
              <p className="text-white/60">Hantera dina konto-inställningar</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#e4d699]" />
                  <div>
                    <CardTitle>Personlig information</CardTitle>
                    <CardDescription>Uppdatera dina personliga uppgifter</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Namn</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black/30 border-[#e4d699]/30 focus:border-[#e4d699]"
                      placeholder="Ditt fullständiga namn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonnummer</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-black/30 border-[#e4d699]/30 focus:border-[#e4d699]"
                      placeholder="Ditt telefonnummer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-postadress</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-black/20 border-[#e4d699]/20 text-white/60"
                    placeholder="Din e-postadress"
                  />
                  <p className="text-sm text-white/50">E-postadressen kan inte ändras här. Kontakta support om du behöver ändra den.</p>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Sparar..." : "Spara ändringar"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[#e4d699]" />
                  <div>
                    <CardTitle>Notifikationer</CardTitle>
                    <CardDescription>Välj vilka notifikationer du vill få</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Beställningsuppdateringar</Label>
                    <p className="text-sm text-white/60">Få meddelanden om dina beställningar</p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, orderUpdates: checked })
                    }
                  />
                </div>
                <Separator className="bg-[#e4d699]/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Erbjudanden och kampanjer</Label>
                    <p className="text-sm text-white/60">Få meddelanden om specialerbjudanden</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, promotions: checked })
                    }
                  />
                </div>
                <Separator className="bg-[#e4d699]/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nyhetsbrev</Label>
                    <p className="text-sm text-white/60">Få vårt veckovisa nyhetsbrev</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, newsletter: checked })
                    }
                  />
                </div>
                <Button 
                  onClick={handleSavePreferences} 
                  disabled={isSavingPreferences}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingPreferences ? "Sparar..." : "Spara notifikationsinställningar"}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#e4d699]" />
                  <div>
                    <CardTitle>Integritet</CardTitle>
                    <CardDescription>Hantera dina integritetsinställningar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Synlig profil</Label>
                    <p className="text-sm text-white/60">Låt andra se din profil i recensioner</p>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, profileVisible: checked })
                    }
                  />
                </div>
                <Separator className="bg-[#e4d699]/20" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dela data för förbättringar</Label>
                    <p className="text-sm text-white/60">Hjälp oss förbättra tjänsten genom att dela anonym data</p>
                  </div>
                  <Switch
                    checked={privacy.shareData}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, shareData: checked })
                    }
                  />
                </div>
                <Button 
                  onClick={handleSavePreferences} 
                  disabled={isSavingPreferences}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingPreferences ? "Sparar..." : "Spara integritetsinställningar"}
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border border-red-500/20 bg-black/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-400" />
                  <div>
                    <CardTitle className="text-red-400">Kontoåtgärder</CardTitle>
                    <CardDescription>Hantera ditt konto</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/5">
                    <h4 className="font-medium text-yellow-400 mb-2">Logga ut</h4>
                    <p className="text-sm text-white/60 mb-3">
                      Logga ut från ditt konto på denna enhet.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={signOut}
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      Logga ut
                    </Button>
                  </div>

                  <div className="p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                    <h4 className="font-medium text-red-400 mb-2">Ta bort konto</h4>
                    <p className="text-sm text-white/60 mb-3">
                      Permanent ta bort ditt konto och all tillhörande data. Denna åtgärd kan inte ångras.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ta bort konto
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-red-400 font-medium">
                          Är du säker? Denna åtgärd kan inte ångras.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            size="sm"
                          >
                            Ja, ta bort mitt konto
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            size="sm"
                            className="border-[#e4d699]/30"
                          >
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 