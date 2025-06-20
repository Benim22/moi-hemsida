"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
  options?: {
    flamberad?: boolean
    glutenFritt?: boolean
    laktosFritt?: boolean
    customizations?: string[]
  }
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  addItemWithOptions: (item: Omit<CartItem, "quantity">, options?: CartItem['options']) => void
  removeItem: (id: number, itemIndex?: number) => void
  updateQuantity: (id: number, quantity: number, itemIndex?: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  timeUntilClear: number // Sekunder tills cart rensas
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const addItemInProgress = useRef(false)
  const [timeUntilClear, setTimeUntilClear] = useState<number>(0)

  // Initialize cart from localStorage on client side
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem("cart")
    const storedLastActivity = localStorage.getItem("cartLastActivity")
    
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        const lastActivityTime = storedLastActivity ? parseInt(storedLastActivity) : Date.now()
        
        // Kontrollera om cart är äldre än 5 minuter (300000 ms)
        const now = Date.now()
        const timeDiff = now - lastActivityTime
        const AUTO_CLEAR_TIME = 5 * 60 * 1000 // 5 minuter
        
        if (timeDiff > AUTO_CLEAR_TIME && parsedCart.length > 0) {
          console.log('🗑️ Cart rensad automatiskt efter 5 minuter av inaktivitet')
          setItems([])
          localStorage.removeItem("cart")
          localStorage.removeItem("cartLastActivity")
          // Visa notifikation om cart rensades automatiskt
          setTimeout(() => {
            toast({
              title: "Kundvagn rensad",
              description: "Din kundvagn har rensats automatiskt efter 5 minuter av inaktivitet.",
              variant: "default",
            })
          }, 1000) // Vänta lite så toast-systemet hinner initialiseras
        } else {
          setItems(parsedCart)
          setLastActivity(lastActivityTime)
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        setItems([])
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items))
      
      // Uppdatera lastActivity när cart ändras (om items finns)
      if (items.length > 0) {
        const now = Date.now()
        setLastActivity(now)
        localStorage.setItem("cartLastActivity", now.toString())
      }
    }
  }, [items, mounted])

  // Auto-clear timer - kontrollera var 30:e sekund
  useEffect(() => {
    if (!mounted || items.length === 0) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastActivity
      const AUTO_CLEAR_TIME = 5 * 60 * 1000 // 5 minuter
      const timeLeft = Math.max(0, AUTO_CLEAR_TIME - timeDiff)
      
      // Uppdatera återstående tid i sekunder
      setTimeUntilClear(Math.ceil(timeLeft / 1000))

      if (timeDiff > AUTO_CLEAR_TIME) {
        console.log('🗑️ Cart rensad automatiskt efter 5 minuter av inaktivitet')
        setItems([])
        localStorage.removeItem("cart")
        localStorage.removeItem("cartLastActivity")
        setTimeUntilClear(0)
        // Visa notifikation om cart rensades automatiskt
        toast({
          title: "Kundvagn rensad",
          description: "Din kundvagn har rensats automatiskt efter 5 minuter av inaktivitet.",
          variant: "default",
        })
      }
    }, 1000) // Kontrollera varje sekund för mer exakt timer

    return () => clearInterval(interval)
  }, [mounted, items.length, lastActivity])

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    // Förhindra samtidiga addItem-anrop
    if (addItemInProgress.current) {
      return
    }
    
    addItemInProgress.current = true
    
    // Uppdatera lastActivity när användaren lägger till något
    const now = Date.now()
    setLastActivity(now)
    if (mounted) {
      localStorage.setItem("cartLastActivity", now.toString())
    }

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => 
        item.id === newItem.id && 
        JSON.stringify(item.options) === JSON.stringify(undefined)
      )

      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const existingItem = prevItems[existingItemIndex]
        const newQuantity = existingItem.quantity + 1
        
        // Skapa ny array med uppdaterat item
        const updatedItems = prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        return updatedItems
      } else {
        // Item doesn't exist, add new item with quantity 1
        const newItems = [...prevItems, { ...newItem, quantity: 1 }]
        return newItems
      }
    })
    
    // Rensa flaggan efter en kort delay
    setTimeout(() => {
      addItemInProgress.current = false
    }, 100)
  }, [mounted])

  const addItemWithOptions = useCallback((newItem: Omit<CartItem, "quantity">, options?: CartItem['options']) => {
    // Förhindra samtidiga addItem-anrop
    if (addItemInProgress.current) {
      return
    }
    
    addItemInProgress.current = true
    
    // Uppdatera lastActivity när användaren lägger till något
    const now = Date.now()
    setLastActivity(now)
    if (mounted) {
      localStorage.setItem("cartLastActivity", now.toString())
    }

    setItems((prevItems) => {
      // Skapa unik identifierare för item med options
      const itemWithOptions = { ...newItem, options }
      const existingItemIndex = prevItems.findIndex((item) => 
        item.id === newItem.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      )

      if (existingItemIndex > -1) {
        // Item med samma options exists, increment quantity
        const existingItem = prevItems[existingItemIndex]
        const newQuantity = existingItem.quantity + 1
        
        // Skapa ny array med uppdaterat item
        const updatedItems = prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        return updatedItems
      } else {
        // Item med dessa options doesn't exist, add new item with quantity 1
        const newItems = [...prevItems, { ...itemWithOptions, quantity: 1 }]
        return newItems
      }
    })
    
    // Rensa flaggan efter en kort delay
    setTimeout(() => {
      addItemInProgress.current = false
    }, 100)
  }, [mounted])

  const removeItem = (id: number, itemIndex?: number) => {
    // Uppdatera lastActivity när användaren tar bort något
    const now = Date.now()
    setLastActivity(now)
    if (mounted) {
      localStorage.setItem("cartLastActivity", now.toString())
    }

    setItems((prevItems) => {
      if (itemIndex !== undefined) {
        // Ta bort specifik item med index (för items med alternativ)
        return prevItems.filter((_, index) => index !== itemIndex)
      } else {
        // Ta bort första item med detta id (backward compatibility)
        return prevItems.filter((item) => item.id !== id)
      }
    })
  }

  const updateQuantity = (id: number, quantity: number, itemIndex?: number) => {
    // Uppdatera lastActivity när användaren ändrar kvantitet
    const now = Date.now()
    setLastActivity(now)
    if (mounted) {
      localStorage.setItem("cartLastActivity", now.toString())
    }

    if (quantity <= 0) {
      removeItem(id, itemIndex)
      return
    }

    setItems((prevItems) => {
      if (itemIndex !== undefined) {
        // Uppdatera specifik item med index
        return prevItems.map((item, index) => 
          index === itemIndex ? { ...item, quantity } : item
        )
      } else {
        // Uppdatera första item med detta id (backward compatibility)
        return prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      }
    })
  }

  const clearCart = () => {
    setItems([])
    // Rensa även localStorage när cart rensas manuellt
    if (mounted) {
      localStorage.removeItem("cart")
      localStorage.removeItem("cartLastActivity")
    }
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addItemWithOptions,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        timeUntilClear,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

