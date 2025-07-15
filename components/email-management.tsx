"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Settings, Send, CheckCircle, XCircle, AlertCircle, RefreshCw, Mail, Eye, Calendar } from "lucide-react"

export default function EmailManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("settings")
  const [sendGridConnectionStatus, setSendGridConnectionStatus] = useState(null)
  const [testingSendGrid, setTestingSendGrid] = useState(false)
  const [sendGridDialogOpen, setSendGridDialogOpen] = useState(false)
  const [sendGridTestEmail, setSendGridTestEmail] = useState('')
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, failed: 0, today: 0, success_rate: 0 })
  const [sendGridSettings, setSendGridSettings] = useState([])
  const [localSendGridSettings, setLocalSendGridSettings] = useState({})
  const [emailLogs, setEmailLogs] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  
  // Resend state variabler
  const [resendConnectionStatus, setResendConnectionStatus] = useState(null)
  const [testingResend, setTestingResend] = useState(false)
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [resendTestEmail, setResendTestEmail] = useState('')
  const [resendSettings, setResendSettings] = useState([])
  const [localResendSettings, setLocalResendSettings] = useState({})
  
  const { toast } = useToast()

  useEffect(() => {
    checkSendGridConnection()
    fetchSendGridSettings()
    checkResendConnection()
    fetchResendSettings()
    fetchEmailLogs()
    fetchEmailStats()
  }, [])

  const checkSendGridConnection = async () => {
    try {
      setTestingSendGrid(true)
      console.log('🔍 Testing SendGrid connection...')
      
      const response = await fetch('/api/sendgrid', {
        method: 'GET'
      })
      const result = await response.json()
      
      console.log('📧 SendGrid connection result:', result)
      
      if (result.success) {
        setSendGridConnectionStatus('connected')
        setIsLoading(false)
        toast({
          title: "✅ SendGrid anslutning lyckades!",
          description: "SendGrid API svarar och anslutningen fungerar.",
        })
      } else {
        setSendGridConnectionStatus('error')
        setIsLoading(false)
        toast({
          title: "❌ SendGrid anslutning misslyckades",
          description: result.error || "Okänt fel vid anslutning till SendGrid API",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error checking SendGrid connection:', error)
      setSendGridConnectionStatus('error')
      setIsLoading(false)
      toast({
        title: "❌ Fel vid SendGrid-test",
        description: "Kunde inte testa anslutningen till SendGrid API",
        variant: "destructive"
      })
    } finally {
      setTestingSendGrid(false)
    }
  }

  const handleSendSendGridTestEmail = async () => {
    if (!sendGridTestEmail.trim()) {
      toast({
        title: "❌ E-postadress saknas",
        description: "Ange en giltig e-postadress",
        variant: "destructive"
      })
      return
    }

    try {
      setTestingSendGrid(true)
      const response = await fetch('/api/sendgrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test',
          email: sendGridTestEmail,
          testType: 'admin_test'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ SendGrid test-e-post skickad!",
          description: `Test-email skickades via SendGrid (ID: ${result.messageId})`
        })
        setSendGridDialogOpen(false)
        setSendGridTestEmail('')
        fetchEmailLogs()
        fetchEmailStats()
      } else {
        throw new Error(result.error || 'Okänt fel')
      }
    } catch (error) {
      console.error('Error sending SendGrid test email:', error)
      toast({
        title: "❌ Fel vid SendGrid e-posttest",
        description: error instanceof Error ? error.message : 'Kunde inte skicka test-e-post via SendGrid',
        variant: "destructive"
      })
    } finally {
      setTestingSendGrid(false)
    }
  }

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch('/api/admin/email-logs?limit=20')
      const data = await response.json()
      if (response.ok) {
        setEmailLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching email logs:', error)
    }
  }

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/admin/email-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_stats' })
      })
      const data = await response.json()
      if (response.ok) {
        setEmailStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
    }
  }

  const fetchSendGridSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .in('setting_key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_enabled'])

      if (error) throw error

      setSendGridSettings(data || [])
      
      // Skapa lokala inställningar från databasen
      const localSettings = {}
      data?.forEach(setting => {
        localSettings[setting.setting_key] = setting.setting_value
      })
      setLocalSendGridSettings(localSettings)
    } catch (error) {
      console.error('Error fetching SendGrid settings:', error)
    }
  }

  const updateSendGridSetting = async (settingKey, newValue) => {
    try {
      setIsSaving(true)
      const { data, error } = await supabase
        .from('email_settings')
        .upsert([
          {
            setting_key: settingKey,
            setting_value: newValue,
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'setting_key' })
        .select()

      if (error) throw error

      // Uppdatera lokala inställningar
      setLocalSendGridSettings(prev => ({
        ...prev,
        [settingKey]: newValue
      }))

      // Uppdatera settings array
      setSendGridSettings(prev => {
        const existingIndex = prev.findIndex(s => s.setting_key === settingKey)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], setting_value: newValue }
          return updated
        } else {
          return [...prev, { setting_key: settingKey, setting_value: newValue }]
        }
      })

      toast({
        title: "✅ Inställning sparad",
        description: `${settingKey} har uppdaterats`,
      })
    } catch (error) {
      console.error('Error updating SendGrid setting:', error)
      toast({
        title: "❌ Fel vid sparande",
        description: `Kunde inte uppdatera ${settingKey}`,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getConnectionStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Ansluten'
      case 'error':
        return 'Fel'
      default:
        return 'Okänd'
    }
  }

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
  }

  // Resend funktioner
  const checkResendConnection = async () => {
    try {
      setTestingResend(true)
      console.log('🔍 Testing Resend connection...')
      
      const response = await fetch('/api/test-resend', {
        method: 'GET'
      })
      const result = await response.json()
      
      console.log('📧 Resend connection result:', result)
      
      if (result.success) {
        setResendConnectionStatus('connected')
        toast({
          title: "✅ Resend anslutning lyckades!",
          description: "Resend API svarar och anslutningen fungerar.",
        })
      } else {
        setResendConnectionStatus('error')
        toast({
          title: "❌ Resend anslutning misslyckades",
          description: result.error || "Okänt fel vid anslutning till Resend API",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error checking Resend connection:', error)
      setResendConnectionStatus('error')
      toast({
        title: "❌ Fel vid Resend-test",
        description: "Kunde inte testa anslutningen till Resend API",
        variant: "destructive"
      })
    } finally {
      setTestingResend(false)
    }
  }

  const fetchResendSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

      if (error) throw error

      setResendSettings(data || [])
      
      // Konvertera till local state format
      const localSettings = {}
      data?.forEach(setting => {
        localSettings[setting.setting_key] = setting.setting_value
      })
      setLocalResendSettings(localSettings)
    } catch (error) {
      console.error('Error fetching Resend settings:', error)
    }
  }

  const updateResendSetting = async (settingKey, newValue) => {
    try {
      setIsSaving(true)
      const { data, error } = await supabase
        .from('email_settings')
        .upsert([
          {
            setting_key: settingKey,
            setting_value: newValue,
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'setting_key' })
        .select()

      if (error) throw error

      // Uppdatera lokala inställningar
      setLocalResendSettings(prev => ({
        ...prev,
        [settingKey]: newValue
      }))

      // Uppdatera settings array
      setResendSettings(prev => {
        const existingIndex = prev.findIndex(s => s.setting_key === settingKey)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], setting_value: newValue }
          return updated
        } else {
          return [...prev, { setting_key: settingKey, setting_value: newValue }]
        }
      })

      toast({
        title: "✅ Inställning sparad",
        description: `${settingKey} har uppdaterats`,
      })
    } catch (error) {
      console.error('Error updating Resend setting:', error)
      toast({
        title: "❌ Fel vid sparande",
        description: `Kunde inte uppdatera ${settingKey}`,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendResendTestEmail = async () => {
    if (!resendTestEmail.trim()) {
      toast({
        title: "❌ E-postadress saknas",
        description: "Ange en giltig e-postadress",
        variant: "destructive"
      })
      return
    }

    try {
      setTestingResend(true)
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test',
          email: resendTestEmail,
          testType: 'admin_test'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Resend test-e-post skickad!",
          description: `Test-email skickades via Resend (ID: ${result.messageId})`
        })
        setResendDialogOpen(false)
        setResendTestEmail('')
        fetchEmailLogs()
        fetchEmailStats()
      } else {
        throw new Error(result.error || 'Okänt fel')
      }
    } catch (error) {
      console.error('Error sending Resend test email:', error)
      toast({
        title: "❌ Fel vid Resend e-posttest",
        description: error instanceof Error ? error.message : 'Kunde inte skicka test-e-post via Resend',
        variant: "destructive"
      })
    } finally {
      setTestingResend(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Laddar e-postinställningar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">E-posthantering</h2>
          <p className="text-white/60 mt-1">Hantera e-postleverans via SendGrid</p>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
          SendGrid
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
          <TabsTrigger value="test">Testa</TabsTrigger>
          <TabsTrigger value="logs">Loggar</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SendGrid Inställningar
              </CardTitle>
              <CardDescription>
                Konfigurera SendGrid API-inställningar för e-postleverans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#e4d699]/20 bg-black/30">
                <div className="flex items-center gap-3">
                  {getConnectionStatusIcon(sendGridConnectionStatus)}
                  <div>
                    <p className="font-medium">Anslutningsstatus</p>
                    <p className="text-sm text-white/60">
                      {getConnectionStatusText(sendGridConnectionStatus)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getConnectionStatusColor(sendGridConnectionStatus)}>
                    {getConnectionStatusText(sendGridConnectionStatus)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkSendGridConnection}
                    disabled={testingSendGrid}
                  >
                    {testingSendGrid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="sendgrid_api_key">SendGrid API Nyckel</Label>
                <div className="flex gap-2">
                  <Input
                    id="sendgrid_api_key"
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxxx"
                    value={localSendGridSettings.sendgrid_api_key || ''}
                    onChange={(e) => setLocalSendGridSettings(prev => ({
                      ...prev,
                      sendgrid_api_key: e.target.value
                    }))}
                  />
                  <Button
                    onClick={() => updateSendGridSetting('sendgrid_api_key', localSendGridSettings.sendgrid_api_key)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spara'}
                  </Button>
                </div>
                <p className="text-xs text-white/60">
                  Hämta din API-nyckel från SendGrid dashboard
                </p>
              </div>

              {/* From Email */}
              <div className="space-y-2">
                <Label htmlFor="sendgrid_from_email">Från E-postadress</Label>
                <div className="flex gap-2">
                  <Input
                    id="sendgrid_from_email"
                    type="email"
                    placeholder="Moi Sushi <info@moisushi.se>"
                    value={localSendGridSettings.sendgrid_from_email || ''}
                    onChange={(e) => setLocalSendGridSettings(prev => ({
                      ...prev,
                      sendgrid_from_email: e.target.value
                    }))}
                  />
                  <Button
                    onClick={() => updateSendGridSetting('sendgrid_from_email', localSendGridSettings.sendgrid_from_email)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spara'}
                  </Button>
                </div>
                <p className="text-xs text-white/60">
                  E-postadress och namn som visas som avsändare
                </p>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#e4d699]/20 bg-black/30">
                <div>
                  <p className="font-medium">Aktivera SendGrid</p>
                  <p className="text-sm text-white/60">
                    Aktivera eller inaktivera e-postleverans via SendGrid
                  </p>
                </div>
                <Button
                  variant={localSendGridSettings.sendgrid_enabled === 'true' ? 'default' : 'outline'}
                  onClick={() => updateSendGridSetting('sendgrid_enabled', localSendGridSettings.sendgrid_enabled === 'true' ? 'false' : 'true')}
                  disabled={isSaving}
                >
                  {localSendGridSettings.sendgrid_enabled === 'true' ? 'Aktiverad' : 'Inaktiverad'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resend sektion */}
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Resend Inställningar
              </CardTitle>
              <CardDescription>
                Konfigurera Resend API-inställningar för backup e-postleverans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#e4d699]/20 bg-black/30">
                <div className="flex items-center gap-3">
                  {getConnectionStatusIcon(resendConnectionStatus)}
                  <div>
                    <p className="font-medium">Anslutningsstatus</p>
                    <p className="text-sm text-white/60">
                      {getConnectionStatusText(resendConnectionStatus)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getConnectionStatusColor(resendConnectionStatus)}>
                    {getConnectionStatusText(resendConnectionStatus)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkResendConnection}
                    disabled={testingResend}
                  >
                    {testingResend ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="resend_api_key">Resend API Nyckel</Label>
                <div className="flex gap-2">
                  <Input
                    id="resend_api_key"
                    type="password"
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxx"
                    value={localResendSettings.resend_api_key || ''}
                    onChange={(e) => setLocalResendSettings(prev => ({
                      ...prev,
                      resend_api_key: e.target.value
                    }))}
                  />
                  <Button
                    onClick={() => updateResendSetting('resend_api_key', localResendSettings.resend_api_key)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spara'}
                  </Button>
                </div>
              </div>

              {/* From Email */}
              <div className="space-y-2">
                <Label htmlFor="resend_from_email">Avsändar E-post</Label>
                <div className="flex gap-2">
                  <Input
                    id="resend_from_email"
                    type="email"
                    placeholder="noreply@moisushi.se"
                    value={localResendSettings.resend_from_email || ''}
                    onChange={(e) => setLocalResendSettings(prev => ({
                      ...prev,
                      resend_from_email: e.target.value
                    }))}
                  />
                  <Button
                    onClick={() => updateResendSetting('resend_from_email', localResendSettings.resend_from_email)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spara'}
                  </Button>
                </div>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#e4d699]/20 bg-black/30">
                <div>
                  <p className="font-medium">Aktiverad</p>
                  <p className="text-sm text-white/60">
                    Aktivera Resend för backup e-postleverans
                  </p>
                </div>
                <Button
                  variant={localResendSettings.resend_enabled === 'true' ? 'default' : 'outline'}
                  onClick={() => updateResendSetting('resend_enabled', localResendSettings.resend_enabled === 'true' ? 'false' : 'true')}
                  disabled={isSaving}
                >
                  {localResendSettings.resend_enabled === 'true' ? 'Aktiverad' : 'Inaktiverad'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Testa E-postleverans
              </CardTitle>
              <CardDescription>
                Skicka test-e-post för att verifiera SendGrid-konfigurationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test_email">Test E-postadress</Label>
                <Input
                  id="test_email"
                  type="email"
                  placeholder="test@example.com"
                  value={sendGridTestEmail}
                  onChange={(e) => setSendGridTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendSendGridTestEmail}
                disabled={testingSendGrid || !sendGridTestEmail.trim()}
                className="w-full"
              >
                {testingSendGrid ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Skicka Test E-post
              </Button>
            </CardContent>
          </Card>

          {/* Resend Test */}
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Testa Resend
              </CardTitle>
              <CardDescription>
                Skicka test-e-post för att verifiera Resend-konfigurationen (backup)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend_test_email">Test E-postadress</Label>
                <Input
                  id="resend_test_email"
                  type="email"
                  placeholder="test@example.com"
                  value={resendTestEmail}
                  onChange={(e) => setResendTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendResendTestEmail}
                disabled={testingResend || !resendTestEmail.trim()}
                className="w-full"
              >
                {testingResend ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Skicka Resend Test E-post
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle>E-poststatistik</CardTitle>
              <CardDescription>Översikt över e-postleveranser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-black/30">
                  <div className="text-2xl font-bold text-[#e4d699]">{emailStats.total}</div>
                  <div className="text-sm text-white/60">Totalt</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-black/30">
                  <div className="text-2xl font-bold text-green-400">{emailStats.sent}</div>
                  <div className="text-sm text-white/60">Skickade</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-black/30">
                  <div className="text-2xl font-bold text-red-400">{emailStats.failed}</div>
                  <div className="text-sm text-white/60">Misslyckade</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-black/30">
                  <div className="text-2xl font-bold text-blue-400">{emailStats.today}</div>
                  <div className="text-sm text-white/60">Idag</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="border-[#e4d699]/20 bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                E-postloggar
              </CardTitle>
              <CardDescription>
                Senaste e-postleveranserna och deras status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailLogs.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Inga e-postloggar tillgängliga
                  </div>
                ) : (
                  emailLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-[#e4d699]/10">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {log.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{log.recipient}</span>
                        </div>
                        <div className="text-xs text-white/60">
                          {log.subject}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('sv-SE')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 