'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react'

interface EmailTemplate {
  id: string
  type: string
  name: string
  subject: string
  html_content: string
  text_content: string
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EmailLog {
  id: string
  template_type: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  message_id: string | null
  error_message: string | null
  location: string | null
  sent_at: string
}

interface EmailStats {
  total: number
  sent: number
  failed: number
  today: number
  success_rate: number
}

const EmailManagement = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats>({
    total: 0, sent: 0, failed: 0, today: 0, success_rate: 0
  })
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown')
  const [deliveryDiagnostics, setDeliveryDiagnostics] = useState<any>(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [templateToTest, setTemplateToTest] = useState<EmailTemplate | null>(null)

  // Form states
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate>>({
    type: 'order_confirmation',
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    location: null,
    is_active: true
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    fetchTemplates()
    fetchLogs()
    fetchStats()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.templates)
      } else {
        toast.error(`Fel vid hämtning av mallar: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Kunde inte hämta e-postmallar')
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/email-logs?limit=50')
      const data = await response.json()
      if (response.ok) {
        setLogs(data.logs)
      } else {
        toast.error(`Fel vid hämtning av loggar: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Kunde inte hämta e-postloggar')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/email-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_stats' })
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      } else {
        toast.error(`Fel vid hämtning av statistik: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Kunde inte hämta statistik')
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection' })
      })
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus('connected')
        toast.success('SMTP-anslutning fungerar!')
      } else {
        setConnectionStatus('failed')
        toast.error(`SMTP-anslutning misslyckades: ${data.error}`)
      }
    } catch (error) {
      setConnectionStatus('failed')
      toast.error('Kunde inte testa SMTP-anslutning')
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Ange en e-postadress')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_test', email: testEmail })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Test-email skickat!')
        setTestEmail('')
        fetchLogs()
        fetchStats()
      } else {
        toast.error(`Test-email misslyckades: ${data.error}`)
      }
    } catch (error) {
      toast.error('Kunde inte skicka test-email')
    } finally {
      setLoading(false)
    }
  }

  const testTemplate = (template: EmailTemplate) => {
    setTemplateToTest(template)
    setIsTestModalOpen(true)
  }

  const sendTemplateTest = async (email: string) => {
    if (!templateToTest || !email) {
      toast.error('Mall och e-postadress krävs')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_template_test', 
          email: email,
          template_id: templateToTest.id,
          template_type: templateToTest.type 
        })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Test-email skickat med mall "${templateToTest.name}"!`)
        setIsTestModalOpen(false)
        setTemplateToTest(null)
        fetchLogs()
        fetchStats()
      } else {
        toast.error(`Test-email misslyckades: ${data.error}`)
      }
    } catch (error) {
      toast.error('Kunde inte skicka test-email')
    } finally {
      setLoading(false)
    }
  }

  const checkDeliveryDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/email-delivery')
      const data = await response.json()
      
      if (response.ok) {
        setDeliveryDiagnostics(data)
        toast.success('Leveransdiagnostik uppdaterad!')
      } else {
        toast.error(`Kunde inte hämta diagnostik: ${data.error}`)
      }
    } catch (error) {
      toast.error('Kunde inte hämta leveransdiagnostik')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!editingTemplate.name || !editingTemplate.subject || !editingTemplate.html_content) {
      toast.error('Fyll i alla obligatoriska fält')
      return
    }

    setLoading(true)
    try {
      const url = editingTemplate.id ? '/api/admin/email-templates' : '/api/admin/email-templates'
      const method = editingTemplate.id ? 'PUT' : 'POST'
      const body = editingTemplate.id ? 
        editingTemplate : 
        { action: 'create_template', ...editingTemplate }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      
      if (response.ok) {
        toast.success(editingTemplate.id ? 'Mall uppdaterad!' : 'Mall skapad!')
        setIsEditModalOpen(false)
        setEditingTemplate({
          type: 'order_confirmation',
          name: '',
          subject: '',
          html_content: '',
          text_content: '',
          location: null,
          is_active: true
        })
        fetchTemplates()
      } else {
        toast.error(`Fel: ${data.error}`)
      }
    } catch (error) {
      toast.error('Kunde inte spara mall')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna mall?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/email-templates?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Mall borttagen!')
        fetchTemplates()
      } else {
        toast.error(`Fel: ${data.error}`)
      }
    } catch (error) {
      toast.error('Kunde inte ta bort mall')
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsEditModalOpen(true)
  }

  const viewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsViewModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📧 E-posthantering</h2>
        <div className="flex gap-2">
          <Button onClick={fetchTemplates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Uppdatera
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ny mall
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skickade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Misslyckade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Idag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Framgång</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">E-postmallar</TabsTrigger>
          <TabsTrigger value="logs">E-postloggar</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        Typ: {template.type} | Uppdaterad: {new Date(template.updated_at).toLocaleDateString('sv-SE')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <Button onClick={() => testTemplate(template)} variant="outline" size="sm" title="Testa mall">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => viewTemplate(template)} variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => editTemplate(template)} variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => deleteTemplate(template.id)} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </div>
                      <div>
                        <p className="font-medium">{log.recipient}</p>
                        <p className="text-sm text-gray-600">{log.subject}</p>
                        <p className="text-xs text-gray-500">
                          {log.template_type} | {new Date(log.sent_at).toLocaleString('sv-SE')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                      {log.status === 'sent' ? 'Skickat' : 'Misslyckades'}
                    </Badge>
                  </div>
                  {log.error_message && (
                    <Alert className="mt-2">
                      <AlertDescription>{log.error_message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP-anslutning</CardTitle>
              <CardDescription>
                Testa anslutningen till One.com SMTP-servern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm">
                  {connectionStatus === 'connected' ? 'Ansluten' : 
                   connectionStatus === 'failed' ? 'Anslutning misslyckad' : 'Okänd'}
                </span>
              </div>
              <Button onClick={testConnection} disabled={loading}>
                <Settings className="h-4 w-4 mr-2" />
                Testa anslutning
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skicka test-email</CardTitle>
              <CardDescription>
                Skicka ett test-email för att verifiera att systemet fungerar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">E-postadress</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="din@email.com"
                />
              </div>
              <Button onClick={sendTestEmail} disabled={loading || !testEmail}>
                <Send className="h-4 w-4 mr-2" />
                Skicka test-email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leveransdiagnostik</CardTitle>
              <CardDescription>
                Kontrollera domänens e-postkonfiguration och leveransförmåga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkDeliveryDiagnostics} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Kontrollera leveransförmåga
              </Button>
              
              {deliveryDiagnostics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">SPF Record</h4>
                      <Badge variant={deliveryDiagnostics.spf?.status === 'OK' ? 'default' : 'destructive'}>
                        {deliveryDiagnostics.spf?.status || 'UNKNOWN'}
                      </Badge>
                      {deliveryDiagnostics.spf?.record && (
                        <p className="text-xs text-gray-600">{deliveryDiagnostics.spf.record}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">DMARC Record</h4>
                      <Badge variant={deliveryDiagnostics.dmarc?.status === 'OK' ? 'default' : 'destructive'}>
                        {deliveryDiagnostics.dmarc?.status || 'UNKNOWN'}
                      </Badge>
                      {deliveryDiagnostics.dmarc?.record && (
                        <p className="text-xs text-gray-600">{deliveryDiagnostics.dmarc.record}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">DKIM Records</h4>
                    <Badge variant={deliveryDiagnostics.dkim?.status === 'OK' ? 'default' : 'destructive'}>
                      {deliveryDiagnostics.dkim?.status || 'UNKNOWN'}
                    </Badge>
                    {deliveryDiagnostics.dkim?.records?.map((record: any, index: number) => (
                      <p key={index} className="text-xs text-gray-600">
                        {record.selector}: {record.status}
                      </p>
                    ))}
                  </div>

                  {deliveryDiagnostics.analysis && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Leveransanalys</h4>
                      <Badge variant={
                        deliveryDiagnostics.analysis.overall_status === 'GOOD' ? 'default' : 
                        deliveryDiagnostics.analysis.overall_status === 'NEEDS_IMPROVEMENT' ? 'secondary' : 'destructive'
                      }>
                        {deliveryDiagnostics.analysis.overall_status}
                      </Badge>
                      
                      {deliveryDiagnostics.analysis.gmail_issues?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-600">Gmail Problem:</h5>
                          <ul className="text-xs text-gray-600">
                            {deliveryDiagnostics.analysis.gmail_issues.map((issue: string, index: number) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {deliveryDiagnostics.analysis.outlook_issues?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-600">Outlook Problem:</h5>
                          <ul className="text-xs text-gray-600">
                            {deliveryDiagnostics.analysis.outlook_issues.map((issue: string, index: number) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {deliveryDiagnostics.analysis.recommendations?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-blue-600">Rekommendationer:</h5>
                          <ul className="text-xs text-gray-600">
                            {deliveryDiagnostics.analysis.recommendations.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate.id ? 'Redigera mall' : 'Skapa ny mall'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-type">Typ</Label>
                <Select
                  value={editingTemplate.type}
                  onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_confirmation">Orderbekräftelse</SelectItem>
                    <SelectItem value="booking_confirmation">Bokningsbekräftelse</SelectItem>
                    <SelectItem value="welcome">Välkomstmail</SelectItem>
                    <SelectItem value="test_email">Test-email</SelectItem>
                    <SelectItem value="custom">Anpassad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-name">Namn</Label>
                <Input
                  id="template-name"
                  value={editingTemplate.name || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mall-namn"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Ämne</Label>
              <Input
                id="template-subject"
                value={editingTemplate.subject || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="E-postämne (kan innehålla variabler som {{customer_name}})"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-html">HTML-innehåll</Label>
              <Textarea
                id="template-html"
                value={editingTemplate.html_content || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, html_content: e.target.value }))}
                placeholder="HTML-innehåll för e-post"
                rows={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-text">Text-innehåll (valfritt)</Label>
              <Textarea
                id="template-text"
                value={editingTemplate.text_content || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, text_content: e.target.value }))}
                placeholder="Textversion av e-post"
                rows={8}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={saveTemplate} disabled={loading}>
                {editingTemplate.id ? 'Uppdatera' : 'Skapa'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Template Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visa mall: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Typ:</strong> {selectedTemplate.type}
                </div>
                <div>
                  <strong>Status:</strong> {selectedTemplate.is_active ? 'Aktiv' : 'Inaktiv'}
                </div>
              </div>
              <div>
                <strong>Ämne:</strong> {selectedTemplate.subject}
              </div>
              <div>
                <strong>HTML-innehåll:</strong>
                <div className="mt-2 p-4 bg-gray-100 rounded max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.html_content}</pre>
                </div>
              </div>
              {selectedTemplate.text_content && (
                <div>
                  <strong>Text-innehåll:</strong>
                  <div className="mt-2 p-4 bg-gray-100 rounded max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.text_content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Test Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testa mall: {templateToTest?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Skicka ett test-email med denna mall för att se hur den ser ut.
            </p>
            <div className="space-y-2">
              <Label htmlFor="template-test-email">E-postadress</Label>
              <Input
                id="template-test-email"
                type="email"
                placeholder="din@email.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendTemplateTest((e.target as HTMLInputElement).value)
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={() => {
                const emailInput = document.getElementById('template-test-email') as HTMLInputElement
                sendTemplateTest(emailInput.value)
              }} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Skicka test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmailManagement 