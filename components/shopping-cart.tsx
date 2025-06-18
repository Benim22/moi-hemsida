"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, MapPin, Clock, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart, type CartItem as CartItemType } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
// Sequential order number generation
const generateOrderNumber = async () => {
  try {
    // Försök att hitta nästa tillgängliga ordernummer
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      // Räkna totalt antal orders och lägg till 1 + attempts för att undvika kollisioner
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error counting orders:', error)
        // Fallback till timestamp + random
        return `${Date.now()}${Math.floor(Math.random() * 1000)}`
      }

      const candidateNumber = ((count || 0) + 1 + attempts).toString()
      
      // Kontrollera om detta nummer redan finns
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('order_number', candidateNumber)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // Ingen order med detta nummer finns, vi kan använda det
        return candidateNumber
      }
      
      if (checkError) {
        console.error('Error checking order number:', checkError)
      }
      
      // Numret finns redan, försök nästa
      attempts++
    }
    
    // Om alla försök misslyckades, använd timestamp + random
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`
  } catch (error) {
    console.error('Error in generateOrderNumber:', error)
    // Fallback till timestamp + random
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`
  }
}
import { useRouter } from "next/navigation"
// import { useSimpleAuth } from "@/context/simple-auth-context"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { supabase } from "@/lib/supabase"
import { useLocation } from "@/contexts/LocationContext"

export function CartIcon() {
  const { totalItems, setIsCartOpen } = useCart()

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#e4d699] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  )
}

function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center py-3 border-b border-[#e4d699]/10">
      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-black/30 border border-[#e4d699]/10">
        <img
          src={item.image || "/placeholder.svg?height=64&width=64"}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="ml-4 flex-grow">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-[#e4d699]">{item.price} kr</p>
      </div>

      <div className="flex items-center">
        <div className="flex items-center border border-[#e4d699]/30 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none hover:bg-[#e4d699]/10"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none hover:bg-[#e4d699]/10"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-2 text-white/60 hover:text-white hover:bg-red-500/10"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function OrderSuccessModal({ 
  orderNumber, 
  customerName, 
  items, 
  totalPrice,
  specialInstructions,
  isLoggedIn,
  onClose 
}: {
  orderNumber: string
  customerName: string
  items: CartItemType[]
  totalPrice: number
  specialInstructions?: string
  isLoggedIn: boolean
  onClose: () => void
}) {
  return (
    <div className="flex-grow overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-[#e4d699] mb-2">Tack för din beställning!</h2>
      <p className="text-white/80 mb-6">Din beställning har tagits emot och kommer att förberedas snart.</p>

      {/* Order Details */}
      <div className="w-full max-w-md bg-black/30 rounded-lg p-4 border border-[#e4d699]/20 mb-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e4d699]/20">
          <span className="font-medium">Ordernummer:</span>
          <span className="text-[#e4d699] font-bold">#{orderNumber}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e4d699]/20">
          <span className="font-medium">Kund:</span>
          <span className="text-white/80">{customerName}</span>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-sm text-white/80">Beställda varor:</h4>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span className="text-[#e4d699]">{item.price * item.quantity} kr</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#e4d699]/20 font-bold">
          <span>Totalt:</span>
          <span className="text-[#e4d699] text-lg">{totalPrice} kr</span>
        </div>
        
        {specialInstructions && (
          <div className="mt-4 pt-2 border-t border-[#e4d699]/20">
            <h4 className="font-medium text-sm text-orange-400 mb-1">Speciella önskemål:</h4>
            <p className="text-sm text-orange-300 bg-orange-500/10 p-2 rounded border border-orange-500/30">
              {specialInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 w-full max-w-md">
        <h4 className="font-medium text-blue-400 mb-2">Nästa steg:</h4>
        <ul className="text-sm text-white/80 space-y-1">
          <li>• Vi förbereder din beställning</li>
          <li>• Du får en bekräftelse via e-post</li>
          <li>• Betala när du hämtar i restaurangen</li>
          <li>• Visa detta ordernummer vid avhämtning</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 w-full max-w-md">
        {isLoggedIn ? (
          <Button 
            className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90" 
            onClick={onClose}
          >
            Se mina beställningar
          </Button>
        ) : (
          <Button 
            className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90" 
            onClick={onClose}
          >
            Tillbaka till startsidan
          </Button>
        )}
        <Button 
          variant="outline" 
          className="w-full border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10" 
          onClick={() => window.location.href = "/menu"}
        >
          Fortsätt handla
        </Button>
      </div>
    </div>
  )
}

export function ShoppingCart() {
  const { items, totalPrice, isCartOpen, setIsCartOpen, clearCart, totalItems } = useCart()
  const { toast } = useToast()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleClose = () => {
    setIsCartOpen(false)
    setIsCheckingOut(false)
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Kundvagnen rensad",
      description: "Alla varor har tagits bort från din kundvagn.",
      variant: "default",
    })
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-black border-l border-[#e4d699]/20 z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#e4d699]/20 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-[#e4d699]" />
                {isCheckingOut ? "Kassa" : "Din Kundvagn"}
                {!isCheckingOut && totalItems > 0 && (
                  <span className="ml-2 text-sm text-white/60">({totalItems} varor)</span>
                )}
              </h2>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {isCheckingOut ? (
              <CheckoutView onBack={() => setIsCheckingOut(false)} />
            ) : (
              <>
                {/* Cart items */}
                <div className="flex-grow overflow-y-auto p-4">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-[#e4d699]/10 flex items-center justify-center mb-4">
                        <ShoppingBag className="h-8 w-8 text-[#e4d699]/60" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Din kundvagn är tom</h3>
                      <p className="text-white/60 mb-6">
                        Lägg till några läckra rätter från vår meny för att komma igång.
                      </p>
                      <Button
                        variant="outline"
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                        onClick={handleClose}
                        asChild
                      >
                        <Link href="/menu">Utforska Menyn</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}

                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white"
                          onClick={handleClearCart}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Rensa kundvagn
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer with total and checkout button */}
                {items.length > 0 && (
                  <div className="p-4 border-t border-[#e4d699]/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Totalt:</span>
                      <span className="text-xl font-bold text-[#e4d699]">{totalPrice} kr</span>
                    </div>
                    <Button className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90" onClick={handleCheckout}>
                      Gå till kassan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CheckoutView({ onBack }: { onBack: () => void }) {
  const { items, totalPrice, clearCart, setIsCartOpen } = useCart()
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const { selectedLocation, setSelectedLocation, locations } = useLocation()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [deliveryType, setDeliveryType] = useState("pickup") // pickup or delivery
  const [pickupTime, setPickupTime] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTimeSlot, setPickupTimeSlot] = useState("")
  const [isCustomPickupTime, setIsCustomPickupTime] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  // Auto-fill form when user/profile data is available
  useEffect(() => {
    if (profile) {
      setCustomerName(profile.name || "")
      setCustomerPhone(profile.phone || "")
      setCustomerAddress(profile.address || "")
    }
    if (user) {
      setCustomerEmail(user.email || "")
    }
  }, [user, profile])

  const router = useRouter()

  // Generate order number when component mounts
  useEffect(() => {
    const generateNumber = async () => {
      const number = await generateOrderNumber()
      setOrderNumber(number)
    }
    generateNumber()
  }, [])

  // Helper functions for pickup time
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const generateTimeSlots = (selectedDate: string) => {
    const slots = []
    const now = new Date()
    
    // Öppettider: 11:00 - 21:00 (sista beställning 20:30)
    for (let hour = 11; hour <= 20; hour++) {
      // För sista timmen (20), bara visa :00 och :30
      const maxMinute = hour === 20 ? 30 : 30
      
      for (let minute = 0; minute <= maxMinute; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Om det är idag, bara visa tider som är minst 30 minuter framåt
        if (selectedDate === getTodayDate()) {
          const timeSlot = new Date()
          timeSlot.setHours(hour, minute, 0, 0)
          const minTime = new Date(now.getTime() + 30 * 60000) // 30 min framåt
          
          if (timeSlot >= minTime) {
            slots.push(timeString)
          }
        } else {
          // För andra dagar, visa alla tider
          slots.push(timeString)
        }
      }
    }
    
    console.log(`Generated ${slots.length} time slots for date ${selectedDate}:`, slots)
    return slots
  }

  const getPickupTimeText = () => {
    if (!isCustomPickupTime) {
      switch (pickupTime) {
        case "asap": return "Så snart som möjligt"
        case "30min": return "Om 30 minuter"
        case "1hour": return "Om 1 timme"
        case "2hours": return "Om 2 timmar"
        default: return ""
      }
    } else {
      if (pickupDate && pickupTimeSlot) {
        const date = new Date(pickupDate)
        const isToday = pickupDate === getTodayDate()
        const isTomorrow = pickupDate === getTomorrowDate()
        
        let dateText = ""
        if (isToday) {
          dateText = "Idag"
        } else if (isTomorrow) {
          dateText = "Imorgon"
        } else {
          dateText = date.toLocaleDateString('sv-SE', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })
        }
        
        return `${dateText} kl. ${pickupTimeSlot}`
      }
      return ""
    }
  }

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLocationDropdown) {
        const target = event.target as Element
        if (!target.closest('[data-location-dropdown]')) {
          setShowLocationDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLocationDropdown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // For delivery orders, redirect to Foodora
    if (deliveryType === "delivery") {
      // Simulate processing and then redirect to Foodora
      setTimeout(() => {
        setIsSubmitting(false)
        
        // Show info about Foodora redirect
        toast({
          title: "Omdirigerar till Foodora",
          description: "Du kommer nu att omdirigeras till Foodora för att slutföra din hemleveransbeställning.",
          variant: "default",
        })
        
        // In a real implementation, you would redirect to Foodora's API or website
        // For now, we'll show a message
        setTimeout(() => {
          alert("Här skulle du omdirigeras till Foodora för att slutföra beställningen.\n\nI en riktig implementation skulle detta vara en integration med Foodoras API.")
        }, 1500)
        
      }, 1000)
    } else {
      // For pickup orders, continue with normal flow
      setTimeout(() => {
        setIsSubmitting(false)
        setShowQRCode(true)
      }, 1000)
    }
  }

  const handlePaymentComplete = async () => {
    try {
      // Show loading toast
      toast({
        title: "Bearbetar din beställning...",
        description: "Vänligen vänta medan vi förbereder din beställning.",
        variant: "default",
      })

      // Allow anonymous orders but require validation of customer info
      if (!customerName || !customerPhone || !customerEmail) {
        toast({
          title: "Saknade uppgifter",
          description: "Alla fält måste fyllas i för att lägga en beställning.",
          variant: "destructive",
        })
        return
      }

      // Use anonymous user ID for non-logged in users
      const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

      // Prepare order data for database
      const orderData = {
        user_id: user?.id || ANONYMOUS_USER_ID,
        customer_name: customerName, // Lägg till kundnamn
        items: items,
        total_price: totalPrice,
        amount: totalPrice, // För kompatibilitet
        location: selectedLocation.id.toLowerCase(), // Använd location_id i små bokstäver för enum
        location_id: selectedLocation.id, // Lägg till location_id för admin-notifikationer
        phone: customerPhone,
        delivery_address: deliveryType === "delivery" ? customerAddress : null,
        delivery_type: deliveryType,
        notes: `${deliveryType === "pickup" ? "Hämtningstid" : "Leveranstid"}: ${getPickupTimeText()}${deliveryType === "delivery" && customerAddress ? ` | Leveransadress: ${customerAddress}` : ""}${!user ? " | ANONYM BESTÄLLNING (Under 250kr)" : ""}`,
        special_instructions: specialInstructions || null,
        payment_method: 'cash', // Betala i restaurangen
        order_number: orderNumber
      }

      // Save to database
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast({
          title: "Fel vid sparande",
          description: `Kunde inte spara beställningen: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log("=== BESTÄLLNING SPARAD ===")
      console.log("Database ID:", data.id)
      console.log("Ordernummer:", orderNumber)
      console.log("Kund:", customerName, "-", customerEmail, "-", customerPhone)
      console.log("Customer_name sparad som:", data.customer_name)
      console.log("User_id sparad som:", data.user_id)
      console.log("Avhämtningstid:", getPickupTimeText())
      console.log("Notes fält:", orderData.notes)
      console.log("Varor:", items)
      console.log("Totalt:", totalPrice, "kr")
      console.log("========================")

      // Send location-based notification to admins
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'order',
            title: `Ny beställning i ${selectedLocation.name}`,
            message: `Ordersnummer: #${orderNumber} - ${customerName} - ${totalPrice} kr`,
            user_role: 'admin',
            metadata: {
              location: selectedLocation.id.toLowerCase(),
              order_id: data.id,
              order_number: orderNumber,
              customer_name: customerName,
              total_amount: totalPrice,
              created_by: 'system'
            }
          })

        if (notificationError) {
          console.error('Error sending notification:', notificationError)
        } else {
          console.log('Admin notification sent for location:', selectedLocation.id)
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError)
        // Don't fail the order if notification fails
      }

      // Send order confirmation email using NodeMailer
      try {
        const emailResponse = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'send_template',
            templateType: 'order_confirmation',
            to: customerEmail,
            location: selectedLocation.id,
            variables: {
              customerName,
              customerEmail,
              orderNumber,
              orderDate: new Date().toLocaleDateString('sv-SE'),
              orderType: deliveryType === "delivery" ? "Leverans" : "Avhämtning",
              location: selectedLocation.name,
              deliveryAddress: deliveryType === "delivery" ? customerAddress : undefined,
              pickupTime: getPickupTimeText(),
              items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: `${item.price}`,
                extras: item.extras?.join(', ') || undefined
              })),
              totalPrice: `${totalPrice}`,
              specialInstructions: specialInstructions || undefined,
              restaurantPhone: selectedLocation.phone,
              restaurantAddress: selectedLocation.address
            }
          }),
        })

        const emailResult = await emailResponse.json()
        if (emailResult.success) {
          console.log("Order confirmation email sent successfully")
        } else {
          console.error("Failed to send order confirmation email:", emailResult.error)
        }
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError)
        // Don't fail the order if email fails
      }

      // Show success message and navigate
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Fel",
        description: "Ett oväntat fel inträffade. Försök igen.",
        variant: "destructive",
      })
    }
  }

  if (showSuccessModal) {
    return <OrderSuccessModal 
      orderNumber={orderNumber}
      customerName={customerName}
      items={items}
      totalPrice={totalPrice}
      specialInstructions={specialInstructions}
      isLoggedIn={!!user}
      onClose={() => {
        clearCart()
        setShowSuccessModal(false)
        setIsCartOpen(false) // Stäng cart sidebaren
        // Skicka inloggade användare till sina beställningar, anonyma till startsidan
        if (user) {
          router.push("/profile/orders")
        } else {
          router.push("/")
        }
      }}
    />
  }

  if (showQRCode) {
    return (
      <div className="flex-grow overflow-y-auto p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Betalningsmetod</h3>

          {/* Payment in restaurant - available */}
          <div className="mb-4 border border-[#e4d699]/30 rounded-lg p-4 bg-black/30 flex items-center cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-[#e4d699]/10 flex items-center justify-center mr-3">
              <span className="text-[#e4d699] text-xl">$</span>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">Betala i restaurangen</h4>
              <p className="text-sm text-white/60">Betala när du hämtar din beställning i restaurangen</p>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-[#e4d699] flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-[#e4d699]"></div>
            </div>
          </div>

          {/* Swish - unavailable */}
          <div className="mb-4 border border-white/10 rounded-lg p-4 bg-black/20 flex items-center opacity-50 cursor-not-allowed">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mr-3">
              <span className="text-white/40 text-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 10H19V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">Swish</h4>
              <p className="text-sm text-white/40">Inte tillgänglig för tillfället</p>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-white/20 flex items-center justify-center"></div>
          </div>

          {/* Card - unavailable */}
          <div className="mb-4 border border-white/10 rounded-lg p-4 bg-black/20 flex items-center opacity-50 cursor-not-allowed">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mr-3">
              <span className="text-white/40 text-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="2"
                    y1="10"
                    x2="22"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">Kort</h4>
              <p className="text-sm text-white/40">Inte tillgänglig för tillfället</p>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-white/20 flex items-center justify-center"></div>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-6">
          Din beställning kommer att förberedas när du anländer till restaurangen. Vi skickar en bekräftelse till din
          e-post.
        </p>

        <Button className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full" onClick={handlePaymentComplete}>
          Bekräfta beställning
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-grow overflow-y-auto p-4">
      <Button variant="ghost" className="mb-4 text-white/60 hover:text-white" onClick={onBack}>
        ← Tillbaka till kundvagnen
      </Button>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Din beställning</h3>
        <div className="bg-black/30 rounded-lg p-4 border border-[#e4d699]/10">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-[#e4d699]/10 last:border-0">
              <div className="flex items-center">
                <span className="font-medium mr-2">{item.quantity}x</span>
                <span>{item.name}</span>
              </div>
              <span className="text-[#e4d699]">{item.price * item.quantity} kr</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 font-bold">
            <span>Totalt</span>
            <span className="text-[#e4d699]">{totalPrice} kr</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dina uppgifter</h3>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="mb-4 text-sm text-white/70 flex items-center justify-between">
              <span>Har du ett konto?</span>
              <Button
                variant="link"
                className="text-[#e4d699] p-0 h-auto font-medium"
                onClick={() => router.push("/auth/login?redirect=/order")}
              >
                Logga in för att fylla i automatiskt
              </Button>
            </div>
          )}

          {/* Auto-filled notice for logged in users */}
          {user && profile && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">
                ✓ Dina uppgifter har fyllts i automatiskt från din profil
              </p>
            </div>
          )}

          {/* Delivery Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Leveranstyp</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  deliveryType === "pickup"
                    ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                    : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                }`}
              >
                <div className="font-medium">Avhämtning</div>
                <div className="text-xs opacity-80">Hämta i restaurangen</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("delivery")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  deliveryType === "delivery"
                    ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                    : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                }`}
              >
                <div className="font-medium">Hemleverans</div>
                <div className="text-xs opacity-80">Leverans till din adress</div>
              </button>
            </div>
          </div>

          {/* Customer details - only show for pickup */}
          {deliveryType === "pickup" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Namn
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={deliveryType === "pickup"}
                  className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none"
                  placeholder="Ditt namn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefonnummer
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required={deliveryType === "pickup"}
                  className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none"
                  placeholder="Ditt telefonnummer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-post
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required={deliveryType === "pickup"}
                  className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none"
                  placeholder="Din e-postadress"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Önskad avhämtningstid
                </Label>
                
                {/* Quick time options */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPickupTime(false)
                        setPickupTime("asap")
                        setPickupDate("")
                        setPickupTimeSlot("")
                      }}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        !isCustomPickupTime && pickupTime === "asap"
                          ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                          : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                      }`}
                    >
                      Så snart som möjligt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPickupTime(false)
                        setPickupTime("30min")
                        setPickupDate("")
                        setPickupTimeSlot("")
                      }}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        !isCustomPickupTime && pickupTime === "30min"
                          ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                          : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                      }`}
                    >
                      Om 30 minuter
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPickupTime(false)
                        setPickupTime("1hour")
                        setPickupDate("")
                        setPickupTimeSlot("")
                      }}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        !isCustomPickupTime && pickupTime === "1hour"
                          ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                          : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                      }`}
                    >
                      Om 1 timme
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPickupTime(false)
                        setPickupTime("2hours")
                        setPickupDate("")
                        setPickupTimeSlot("")
                      }}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        !isCustomPickupTime && pickupTime === "2hours"
                          ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                          : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                      }`}
                    >
                      Om 2 timmar
                    </button>
                  </div>
                </div>

                {/* Custom time option */}
                <div className="border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPickupTime(true)
                      setPickupTime("")
                      setPickupDate(getTodayDate())
                    }}
                    className={`w-full p-3 rounded-lg border text-sm transition-colors ${
                      isCustomPickupTime
                        ? "border-[#e4d699] bg-[#e4d699]/10 text-[#e4d699]"
                        : "border-white/20 bg-black/30 text-white/80 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Välj specifik tid och datum
                    </div>
                  </button>
                </div>

                {/* Custom date and time picker */}
                {isCustomPickupTime && (
                  <div className="space-y-3 p-4 bg-black/20 rounded-lg border border-[#e4d699]/20">
                    <div className="space-y-2">
                      <Label htmlFor="pickupDate" className="text-sm font-medium">
                        Datum
                      </Label>
                      <select
                        id="pickupDate"
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value)
                          setPickupTimeSlot("") // Reset time slot when date changes
                        }}
                        required={isCustomPickupTime}
                        className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none"
                      >
                        <option value="">Välj datum</option>
                        <option value={getTodayDate()}>
                          Idag ({new Date().toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' })})
                        </option>
                        <option value={getTomorrowDate()}>
                          Imorgon ({new Date(Date.now() + 24*60*60*1000).toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' })})
                        </option>
                        {/* Add next 5 days */}
                        {Array.from({ length: 5 }, (_, i) => {
                          const date = new Date()
                          date.setDate(date.getDate() + i + 2)
                          const dateStr = date.toISOString().split('T')[0]
                          return (
                            <option key={dateStr} value={dateStr}>
                              {date.toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                                         {pickupDate && (
                       <div className="space-y-2">
                         <Label htmlFor="pickupTimeSlot" className="text-sm font-medium">
                           Tid
                         </Label>
                         <select
                           id="pickupTimeSlot"
                           value={pickupTimeSlot}
                           onChange={(e) => {
                             console.log('Vald tid:', e.target.value)
                             setPickupTimeSlot(e.target.value)
                           }}
                           required={isCustomPickupTime && pickupDate}
                           className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none"
                         >
                           <option value="">Välj tid</option>
                           {generateTimeSlots(pickupDate).map((time) => (
                             <option key={time} value={time}>
                               {time}
                             </option>
                           ))}
                         </select>
                         <p className="text-xs text-white/60">
                           Öppettider: 11:00 - 20:30 (sista beställning)
                         </p>
                       </div>
                     )}
                  </div>
                )}

                {/* Show selected time */}
                {((!isCustomPickupTime && pickupTime) || (isCustomPickupTime && pickupDate && pickupTimeSlot)) && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      ✓ Vald avhämtningstid: <strong>{getPickupTimeText()}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location selection - only show for pickup */}
          {deliveryType === "pickup" && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Hämtningsställe
              </Label>
              <div className="relative" data-location-dropdown>
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full p-3 rounded-md bg-[#e4d699]/10 border border-[#e4d699]/30 text-white hover:bg-[#e4d699]/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium">{selectedLocation?.displayName || "Välj plats"}</div>
                      <div className="text-sm text-white/70">{selectedLocation?.address || "Ingen plats vald"}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-[#e4d699] transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Location Dropdown */}
                <AnimatePresence>
                  {showLocationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-[#e4d699]/30 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {locations && locations.length > 0 ? locations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(location)
                            setShowLocationDropdown(false)
                          }}
                          className="w-full p-3 text-left hover:bg-[#e4d699]/10 transition-colors border-b border-[#e4d699]/10 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">{location.displayName}</div>
                              <div className="text-sm text-white/70">{location.address}</div>
                              <div className="text-xs text-white/50 mt-1">
                                {location.phone} • {location.hours.weekdays}
                              </div>
                            </div>
                            {selectedLocation?.id === location.id && (
                              <Check className="h-4 w-4 text-[#e4d699]" />
                            )}
                          </div>
                        </button>
                      )) : (
                        <div className="p-3 text-center text-white/60">
                          Inga platser tillgängliga
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-white/60">
                Välj vilken restaurang du vill hämta din beställning från.
              </p>
            </div>
          )}

          {/* Special Instructions - show for both pickup and delivery */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="text-sm font-medium">
              Speciella önskemål (valfritt)
            </Label>
            <textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 rounded-md bg-black/50 border border-[#e4d699]/30 text-white focus:border-[#e4d699] focus:outline-none resize-none"
              placeholder="T.ex. allergier, extra instruktioner, önskemål om tillagning..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-white/60">
              Berätta om allergier, speciella önskemål eller andra instruktioner (max 500 tecken)
            </p>
            {specialInstructions && (
              <p className="text-xs text-white/40">
                {specialInstructions.length}/500 tecken
              </p>
            )}
          </div>

          {/* Foodora info - only show for delivery */}
          {deliveryType === "delivery" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Leveranspartner</Label>
              <div className="w-full p-4 rounded-md bg-black/30 border border-[#e4d699]/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      src="/Foodora.png" 
                      alt="Foodora" 
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-white">Foodora</div>
                    <div className="text-sm text-white/70">Hemleverans genom Foodora</div>
                  </div>
                </div>
                <p className="text-xs text-white/60 mt-3">
                  Du kommer att omdirigeras till Foodora för att slutföra beställningen
                </p>
                {totalPrice < 150 && (
                  <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-xs text-orange-400">
                      ⚠️ Minsta beställning för hemleverans är 150 kr. 
                      Du behöver lägga till {150 - totalPrice} kr till.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90" 
          disabled={
            isSubmitting || 
            (deliveryType === "delivery" && totalPrice < 150) ||
            (deliveryType === "pickup" && !customerName) ||
            (deliveryType === "pickup" && !customerPhone) ||
            (deliveryType === "pickup" && !customerEmail) ||
            (deliveryType === "pickup" && !isCustomPickupTime && !pickupTime) ||
            (deliveryType === "pickup" && isCustomPickupTime && (!pickupDate || !pickupTimeSlot))
          }
        >
          {isSubmitting 
            ? "Bearbetar..." 
            : deliveryType === "delivery" 
              ? totalPrice < 150 
                ? `Lägg till ${150 - totalPrice} kr för hemleverans`
                : "Fortsätt till Foodora"
              : (!isCustomPickupTime && !pickupTime) || (isCustomPickupTime && (!pickupDate || !pickupTimeSlot))
                ? "Välj avhämtningstid"
                : "Fortsätt till betalning"
          }
        </Button>
      </form>
    </div>
  )
}

