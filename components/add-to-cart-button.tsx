"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check, Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { trackEvent } from "@/lib/analytics"
import { ItemOptionsModal } from "@/components/item-options-modal"

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    image?: string
    category?: string
  }
  variant?: "default" | "outline" | "icon"
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCartButton({ product, variant = "default", size = "default" }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdded, setIsAdded] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const lastClickTime = useRef(0)
  const isProcessing = useRef(false)

  // Kontrollera om produkten behöver alternativ
  const needsOptions = [
    "Crazy Shrimp", 
    "Crazy Salmon", 
    "Magic Tempura"
  ].includes(product.name)

  const handleAddToCart = () => {
    const now = Date.now()
    
    // Robust debounce - förhindra klick inom 500ms
    if (now - lastClickTime.current < 500) {
      return
    }
    
    // Förhindra samtidiga processer
    if (isProcessing.current) {
      return
    }
    
    // Förhindra dubbla klick genom att kolla om knappen redan är "added"
    if (isAdded) {
      return
    }
    
    // Sätt processing-flagga
    isProcessing.current = true
    lastClickTime.current = now
    
    // Om produkten behöver alternativ, visa modal
    if (needsOptions) {
      setShowOptionsModal(true)
      isProcessing.current = false
      return
    }
    
    addItem(product)
    setIsAdded(true)

    // Spåra tillägg till kundvagn
    trackEvent('cart', 'add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      category: product.category || 'unknown'
    })

    toast({
      title: "Tillagd i kundvagnen",
      description: `${product.name} har lagts till i din kundvagn.`,
      variant: "default",
    })

    // Reset the button after 1.5 seconds
    setTimeout(() => {
      setIsAdded(false)
      isProcessing.current = false
    }, 1500)
  }

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
        onClick={handleAddToCart}
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={
          variant === "outline"
            ? "border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            : "bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
        }
        onClick={handleAddToCart}
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="added"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Check className="mr-2 h-4 w-4" />
              Tillagd
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Lägg till
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <ItemOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        product={product}
      />
    </>
  )
}

