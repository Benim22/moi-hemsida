"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShoppingBag, Clock, CheckCircle, XCircle, Package, Trash2 } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  total: number
  status: string
  created_at: string
  updated_at: string
  delivery_address?: string
  phone?: string
  notes?: string
}

export default function OrdersPage() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setIsPageLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        return
      }

      if (data) {
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", deleteOrderId)
        .eq("user_id", user?.id) // Extra säkerhet - endast egna beställningar

      if (error) {
        throw error
      }

      // Ta bort från lokal state
      setOrders(prev => prev.filter(order => order.id !== deleteOrderId))
      
      toast({
        title: "Beställning borttagen",
        description: "Din beställning har tagits bort.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Fel vid borttagning",
        description: "Kunde inte ta bort beställningen. Försök igen senare.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteOrderId(null)
    }
  }

  const canDeleteOrder = (order: Order) => {
    // Endast beställningar som är "pending" eller "cancelled" kan tas bort
    return order.status === "pending" || order.status === "cancelled"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Stockholm'
    }
    return date.toLocaleDateString('sv-SE', options)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <Package className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "confirmed":
        return "bg-blue-500/20 text-blue-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "cancelled":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Väntar"
      case "confirmed":
        return "Bekräftad"
      case "completed":
        return "Klar"
      case "cancelled":
        return "Avbruten"
      default:
        return status
    }
  }

  if (isPageLoading) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699]"></div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push("/auth/login?redirect=/profile/orders")
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Du måste vara inloggad för att se denna sida.</p>
          <Button onClick={() => router.push("/auth/login?redirect=/profile/orders")}>
            Logga in
          </Button>
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
              <h1 className="text-3xl font-bold">Mina beställningar</h1>
              <p className="text-white/60">Här kan du se alla dina beställningar</p>
            </div>
          </div>

          {isLoading ? (
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
                <p className="text-white/60">Laddar beställningar...</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardContent className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-[#e4d699]/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Inga beställningar än</h3>
                <p className="text-white/60 mb-6">
                  Du har inte gjort några beställningar ännu. Börja handla för att se dina beställningar här!
                </p>
                <Button
                  onClick={() => router.push("/menu")}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  Visa meny
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="border border-[#e4d699]/20 bg-black/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Beställning #{order.id.slice(-8)}
                        </CardTitle>
                        <p className="text-sm text-white/60">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={`${order.id}-${index}`} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-white/60">Antal: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">{item.price * item.quantity} kr</p>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-[#e4d699]/20" />

                      {/* Order Details */}
                      <div className="space-y-2">
                        {order.delivery_address && (
                          <div>
                            <p className="text-sm font-medium text-white/80">Leveransadress:</p>
                            <p className="text-sm text-white/60">{order.delivery_address}</p>
                          </div>
                        )}
                        {order.phone && (
                          <div>
                            <p className="text-sm font-medium text-white/80">Telefon:</p>
                            <p className="text-sm text-white/60">{order.phone}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div>
                            <p className="text-sm font-medium text-white/80">Kommentarer:</p>
                            <p className="text-sm text-white/60">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-[#e4d699]/20" />

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">Totalt:</p>
                        <p className="text-lg font-bold text-[#e4d699]">{order.total} kr</p>
                      </div>

                      {/* Actions */}
                      {canDeleteOrder(order) && (
                        <div className="pt-4 border-t border-[#e4d699]/20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteOrderId(order.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Ta bort beställning
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteOrderId !== null} onOpenChange={() => setDeleteOrderId(null)}>
            <DialogContent className="bg-black/90 border border-[#e4d699]/30">
              <DialogHeader>
                <DialogTitle className="text-[#e4d699]">Bekräfta borttagning</DialogTitle>
                <DialogDescription className="text-white/80">
                  Är du säker på att du vill ta bort denna beställning? Detta kan inte ångras.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOrderId(null)}
                  disabled={isDeleting}
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleDeleteOrder}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Tar bort...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Ta bort
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 