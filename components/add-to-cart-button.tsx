"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check, Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

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

  const handleAddToCart = () => {
    addItem(product)
    setIsAdded(true)

    toast({
      title: "Tillagd i kundvagnen",
      description: `${product.name} har lagts till i din kundvagn.`,
      variant: "default",
    })

    // Reset the button after 1.5 seconds
    setTimeout(() => {
      setIsAdded(false)
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
  )
}

