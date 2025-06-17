"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FoodItemDetails {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  popular?: boolean
  ingredients?: string[]
  allergens?: string[]
  preparationTime?: string
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sodium?: number
  }
  spicyLevel?: number
}

interface FoodItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FoodItemDetails | null
}

export function FoodItemModal({ open, onOpenChange, item }: FoodItemModalProps) {
  const [activeTab, setActiveTab] = useState("info")

  if (!item) return null

  const renderSpicyLevel = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full", i < level ? "bg-red-500" : "bg-gray-600")} />
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black border border-[#e4d699]/30 overflow-hidden rounded-lg">
        <div className="relative h-56 md:h-72 overflow-hidden rounded-t-lg">
          <img 
            src={item.image || "/placeholder.svg"} 
            alt={item.name} 
            className="w-full h-full object-cover object-center" 
            style={{ objectPosition: 'center 30%' }}
            loading="lazy"
            decoding="async"
          />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end">
            <div className="p-6 w-full">
              <div className="flex items-center gap-2 mb-2">
                {item.popular && <Badge className="bg-[#e4d699] text-black font-medium">Populär</Badge>}
                {item.spicyLevel && item.spicyLevel > 0 && (
                  <Badge className="bg-red-500/90 text-white font-medium">{item.spicyLevel > 1 ? "Kryddig" : "Lätt kryddad"}</Badge>
                )}
                <Badge variant="outline" className="bg-black/50 border-white/30 text-white/90 font-medium">
                  {item.category}
                </Badge>
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{item.name}</DialogTitle>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#e4d699]">{item.price} kr</span>
              {item.preparationTime && (
                <div className="flex items-center gap-1 ml-2 text-white/60">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{item.preparationTime}</span>
                </div>
              )}
              {item.spicyLevel && item.spicyLevel > 0 && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs text-white/60">Kryddnivå:</span>
                  {renderSpicyLevel(item.spicyLevel)}
                </div>
              )}
            </div>
            <AddToCartButton product={item} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-black/30 border border-[#e4d699]/20 mb-4">
              <TabsTrigger value="info" className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black">
                Information
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
              >
                Näringsvärde
              </TabsTrigger>
              <TabsTrigger
                value="allergens"
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
              >
                Allergener
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Beskrivning</h3>
                <p className="text-white/80">{item.description}</p>
              </div>

              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Ingredienser</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="bg-black/30 border-[#e4d699]/20 text-white/80">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition">
              {item.nutritionalInfo ? (
                <div className="bg-black/30 border border-[#e4d699]/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Näringsvärde</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {item.nutritionalInfo.calories !== undefined && (
                      <div className="text-center p-3 bg-black/40 rounded-lg">
                        <p className="text-sm text-white/60">Kalorier</p>
                        <p className="text-xl font-bold text-[#e4d699]">{item.nutritionalInfo.calories}</p>
                        <p className="text-xs text-white/40">kcal</p>
                      </div>
                    )}
                    {item.nutritionalInfo.protein !== undefined && (
                      <div className="text-center p-3 bg-black/40 rounded-lg">
                        <p className="text-sm text-white/60">Protein</p>
                        <p className="text-xl font-bold text-[#e4d699]">{item.nutritionalInfo.protein}</p>
                        <p className="text-xs text-white/40">g</p>
                      </div>
                    )}
                    {item.nutritionalInfo.carbs !== undefined && (
                      <div className="text-center p-3 bg-black/40 rounded-lg">
                        <p className="text-sm text-white/60">Kolhydrater</p>
                        <p className="text-xl font-bold text-[#e4d699]">{item.nutritionalInfo.carbs}</p>
                        <p className="text-xs text-white/40">g</p>
                      </div>
                    )}
                    {item.nutritionalInfo.fat !== undefined && (
                      <div className="text-center p-3 bg-black/40 rounded-lg">
                        <p className="text-sm text-white/60">Fett</p>
                        <p className="text-xl font-bold text-[#e4d699]">{item.nutritionalInfo.fat}</p>
                        <p className="text-xs text-white/40">g</p>
                      </div>
                    )}
                    {item.nutritionalInfo.sodium !== undefined && (
                      <div className="text-center p-3 bg-black/40 rounded-lg">
                        <p className="text-sm text-white/60">Natrium</p>
                        <p className="text-xl font-bold text-[#e4d699]">{item.nutritionalInfo.sodium}</p>
                        <p className="text-xs text-white/40">mg</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/50 italic mt-4">
                    Näringsvärden är ungefärliga och kan variera beroende på portionsstorlek och tillagning.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">Näringsinformation är inte tillgänglig för denna rätt.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="allergens">
              {item.allergens && item.allergens.length > 0 ? (
                <div className="bg-black/30 border border-[#e4d699]/10 rounded-lg p-4">
                  <div className="flex items-start mb-4">
                    <AlertTriangle className="h-5 w-5 text-[#e4d699] mr-2 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-medium">Allergener</h3>
                  </div>
                  <div className="space-y-2">
                    {item.allergens.map((allergen, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#e4d699] mr-2"></div>
                        <span className="text-white/80">{allergen}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/50 italic mt-4">
                    Vänligen informera personalen om du har några allergier eller särskilda kostbehov.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">Allergeninformation är inte tillgänglig för denna rätt.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

