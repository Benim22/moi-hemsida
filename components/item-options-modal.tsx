"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Flame, Snowflake, ShoppingBag } from "lucide-react"
import { useCart, type CartItem } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"

interface ItemOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number
    name: string
    price: number
    image?: string
    category?: string
  }
}

export function ItemOptionsModal({ isOpen, onClose, product }: ItemOptionsModalProps) {
  const [flamberadOption, setFlamberadOption] = useState<"ja" | "nej">("ja")
  const { addItemWithOptions } = useCart()
  const { toast } = useToast()

  // Kontrollera om produkten har flamberad-alternativ
  const hasFlamberedOption = [
    "Crazy Shrimp", 
    "Crazy Salmon", 
    "Magic Tempura"
  ].includes(product.name)

  const handleAddToCart = () => {
    const options: CartItem['options'] = {}
    
    if (hasFlamberedOption) {
      options.flamberad = flamberadOption === "ja"
    }

    addItemWithOptions(product, options)

    // Spåra tillägg till kundvagn med alternativ
    trackEvent('cart', 'add_to_cart_with_options', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      category: product.category || 'unknown',
      flamberad: options.flamberad
    })

    const optionText = hasFlamberedOption 
      ? (flamberadOption === "ja" ? " (Flamberad)" : " (Inte flamberad)")
      : ""

    toast({
      title: "Tillagd i kundvagnen",
      description: `${product.name}${optionText} har lagts till i din kundvagn.`,
      variant: "default",
    })

    onClose()
  }

  const handleClose = () => {
    // Återställ till standardvärden
    setFlamberadOption("ja")
    onClose()
  }

  if (!hasFlamberedOption) {
    // Om produkten inte har alternativ, lägg till direkt
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border border-[#e4d699]/20">
        <DialogHeader>
          <DialogTitle className="text-[#e4d699] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Välj alternativ
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Anpassa din <span className="text-[#e4d699] font-medium">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {hasFlamberedOption && (
            <div className="space-y-3">
              <Label className="text-white font-medium">Tillagning</Label>
              <RadioGroup 
                value={flamberadOption} 
                onValueChange={(value) => setFlamberadOption(value as "ja" | "nej")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#e4d699]/20 hover:border-[#e4d699]/40 transition-colors">
                  <RadioGroupItem value="ja" id="flamberad-ja" />
                  <Label htmlFor="flamberad-ja" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-white">Flamberad</span>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      Rekommenderad
                    </Badge>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#e4d699]/20 hover:border-[#e4d699]/40 transition-colors">
                  <RadioGroupItem value="nej" id="flamberad-nej" />
                  <Label htmlFor="flamberad-nej" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Snowflake className="h-4 w-4 text-blue-400" />
                    <span className="text-white">Inte flamberad</span>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                      Mildare smak
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
          >
            Avbryt
          </Button>
          <Button 
            onClick={handleAddToCart}
            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Lägg till i kundvagn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 