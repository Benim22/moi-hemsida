"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Star, Search, Filter, ShoppingBag, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"

// Poké Bowl data
const pokeBowls = [
  {
    id: 1,
    name: "Spicy Beef",
    description:
      "En pokébowl med marinerat yakiniku-kött som kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En kryddig och färgglad rätt som levererar en explosion av smak i varje tugga.",
    price: 135,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
    popular: true,
    ingredients: ["Yakiniku-kött", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 2,
    category: "kött",
    allergens: ["Soja", "Sesam"],
    nutritionalInfo: {
      calories: 520,
      protein: 28,
      carbs: 65,
      fat: 18,
    },
  },
  {
    id: 2,
    name: "Crispy Chicken",
    description:
      "Friterad kyckling serverad med en rad fräscha ingredienser som mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En välbalanserad bowl där krispighet och fräschhet går hand i hand.",
    price: 135,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    popular: true,
    ingredients: ["Friterad kyckling", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 1,
    category: "kött",
    allergens: ["Gluten", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 490,
      protein: 32,
      carbs: 58,
      fat: 15,
    },
  },
  {
    id: 3,
    name: "Crazy Swede",
    description:
      "En oväntad mix av friterad kyckling och yakiniku-kött, som tillsammans blandas med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En rätt med djärva smaker och en härlig texturvariation.",
    price: 145,
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=1000",
    popular: false,
    ingredients: [
      "Friterad kyckling",
      "Yakiniku-kött",
      "Mango",
      "Sjögräs",
      "Gurka",
      "Kimchi",
      "Inlagd rödlök",
      "Edamame",
      "Salladsmix",
    ],
    spicyLevel: 2,
    category: "kött",
    allergens: ["Gluten", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 580,
      protein: 38,
      carbs: 62,
      fat: 22,
    },
  },
  {
    id: 4,
    name: "Magic Lax",
    description:
      "Rå lax kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix i denna eleganta bowl. En fräsch och sofistikerad rätt som hyllar råvarornas naturliga smaker.",
    price: 149,
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=1000",
    popular: true,
    ingredients: ["Rå lax", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 0,
    category: "fisk",
    allergens: ["Fisk", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 450,
      protein: 30,
      carbs: 52,
      fat: 16,
    },
  },
  {
    id: 5,
    name: "Lemon Shrimp",
    description:
      "Friterade tempuraräkor serverade med en uppfriskande mix av mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. Den subtila citronnoten lyfter rätten till nya höjder.",
    price: 135,
    image: "https://images.unsplash.com/photo-1568600891621-50f697b9a1c7?q=80&w=1000",
    popular: false,
    ingredients: [
      "Tempuraräkor",
      "Mango",
      "Sjögräs",
      "Gurka",
      "Kimchi",
      "Inlagd rödlök",
      "Edamame",
      "Salladsmix",
      "Citron",
    ],
    spicyLevel: 0,
    category: "fisk",
    allergens: ["Skaldjur", "Gluten", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 470,
      protein: 26,
      carbs: 60,
      fat: 14,
    },
  },
  {
    id: 6,
    name: "Vegan Bowl",
    description:
      "En helt växtbaserad bowl med tofu inari, kombinerat med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En näringsrik och färgstark rätt som bevisar att veganskt kan vara både mättande och inspirerande.",
    price: 129,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000",
    popular: false,
    ingredients: ["Tofu inari", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 1,
    category: "vegetariskt",
    allergens: ["Soja", "Sesam"],
    nutritionalInfo: {
      calories: 420,
      protein: 18,
      carbs: 68,
      fat: 12,
    },
  },
  {
    id: 7,
    name: "Veggo",
    description:
      "Friterad halloumi blandas med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En oväntad twist för ostälskare som söker en balanserad och smakrik pokébowl.",
    price: 135,
    image: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?q=80&w=1000",
    popular: false,
    ingredients: ["Friterad halloumi", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 0,
    category: "vegetariskt",
    allergens: ["Mjölk", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 460,
      protein: 22,
      carbs: 56,
      fat: 20,
    },
  },
  {
    id: 8,
    name: "Shrimp Bowl",
    description:
      "Handskalade räkor serveras med en balanserad mix av grönsaker och andra noggrant utvalda ingredienser. En elegant bowl som tar dig direkt till autentisk japansk smak.",
    price: 145,
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=1000",
    popular: true,
    ingredients: ["Handskalade räkor", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix"],
    spicyLevel: 0,
    category: "fisk",
    allergens: ["Skaldjur", "Soja", "Sesam"],
    nutritionalInfo: {
      calories: 430,
      protein: 28,
      carbs: 54,
      fat: 12,
    },
  },
]

interface PokeBowlMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PokeBowlMenuModal({ open, onOpenChange }: PokeBowlMenuModalProps) {
  const { toast } = useToast()
  const { addItem } = useCart()
  const [selectedBowl, setSelectedBowl] = useState<(typeof pokeBowls)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("alla")
  const [filteredBowls, setFilteredBowls] = useState(pokeBowls)
  const [activeTab, setActiveTab] = useState("info")
  const [quantity, setQuantity] = useState(1)

  // Filter bowls based on search query and category
  useEffect(() => {
    let result = pokeBowls

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (bowl) =>
          bowl.name.toLowerCase().includes(query) ||
          bowl.description.toLowerCase().includes(query) ||
          bowl.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query)),
      )
    }

    // Filter by category
    if (activeCategory !== "alla") {
      result = result.filter((bowl) => bowl.category === activeCategory)
    }

    setFilteredBowls(result)
  }, [searchQuery, activeCategory])

  // Set first bowl as selected when modal opens
  useEffect(() => {
    if (open && filteredBowls.length > 0 && !selectedBowl) {
      setSelectedBowl(filteredBowls[0])
    }
  }, [open, filteredBowls, selectedBowl])

  const renderSpicyLevel = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full", i < level ? "bg-red-500" : "bg-gray-600")} />
        ))}
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedBowl) return

    const cartItem = {
      id: selectedBowl.id,
      name: selectedBowl.name,
      price: selectedBowl.price,
      image: selectedBowl.image,
      category: "pokebowls",
      quantity: quantity,
    }

    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: selectedBowl.id,
        name: selectedBowl.name,
        price: selectedBowl.price,
        image: selectedBowl.image,
        category: "pokebowls",
      })
    }

    toast({
      title: "Tillagd i kundvagnen",
      description: `${quantity}x ${selectedBowl.name} har lagts till i din kundvagn.`,
      variant: "success",
    })

    // Close the modal after adding to cart
    onOpenChange(false)
  }

  const categories = [
    { id: "alla", label: "Alla" },
    { id: "kött", label: "Kött" },
    { id: "fisk", label: "Fisk & Skaldjur" },
    { id: "vegetariskt", label: "Vegetariskt" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 bg-black border border-[#e4d699]/30 overflow-hidden data-[state=open]:duration-300">
        <div className="relative h-24 bg-gradient-to-r from-[#e4d699]/20 to-[#e4d699]/5 flex items-center justify-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#e4d699]">Poké Bowls</DialogTitle>
            <DialogDescription className="text-white/70">
              Vårt utbud av färska och smakrika Poké Bowls
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col md:flex-row h-[80vh] max-h-[600px]">
          {/* Left side - Menu list */}
          <div className="w-full md:w-1/3 border-r border-[#e4d699]/10 overflow-y-auto">
            <div className="p-4">
              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Sök Poké Bowls..."
                  className="pl-9 bg-black/30 border-[#e4d699]/20 focus:border-[#e4d699]/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "whitespace-nowrap",
                      activeCategory === category.id
                        ? "bg-[#e4d699] text-black border-[#e4d699]"
                        : "bg-black/30 text-white/80 border-[#e4d699]/20 hover:bg-[#e4d699]/20",
                    )}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Recommended section */}
              {activeCategory === "alla" && searchQuery === "" && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white/60 mb-2">REKOMMENDERADE</h3>
                  {pokeBowls
                    .filter((bowl) => bowl.popular)
                    .map((bowl) => (
                      <motion.div
                        key={`popular-${bowl.id}`}
                        className={cn(
                          "p-3 rounded-lg mb-2 cursor-pointer transition-all bg-[#e4d699]/5",
                          selectedBowl?.id === bowl.id
                            ? "bg-[#e4d699]/20 border border-[#e4d699]/30"
                            : "hover:bg-black/40 border border-transparent",
                        )}
                        onClick={() => setSelectedBowl(bowl)}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{bowl.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-[#e4d699] fill-[#e4d699]" />
                            <span className="text-[#e4d699]">{bowl.price} kr</span>
                            <ChevronRight className="h-4 w-4 text-white/50" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}

              {/* All bowls or filtered results */}
              <div>
                {activeCategory !== "alla" || searchQuery !== "" ? (
                  <h3 className="text-sm font-medium text-white/60 mb-2">{filteredBowls.length} RESULTAT</h3>
                ) : (
                  <h3 className="text-sm font-medium text-white/60 mb-2">ALLA POKÉ BOWLS</h3>
                )}

                {filteredBowls.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Inga Poké Bowls hittades</p>
                    <Button
                      variant="link"
                      className="text-[#e4d699] mt-2"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("alla")
                      }}
                    >
                      Återställ filter
                    </Button>
                  </div>
                ) : (
                  filteredBowls.map((bowl) => (
                    <motion.div
                      key={bowl.id}
                      className={cn(
                        "p-3 rounded-lg mb-2 cursor-pointer transition-all",
                        selectedBowl?.id === bowl.id
                          ? "bg-[#e4d699]/20 border border-[#e4d699]/30"
                          : "hover:bg-black/40 border border-transparent",
                      )}
                      onClick={() => setSelectedBowl(bowl)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{bowl.name}</h3>
                        <div className="flex items-center gap-2">
                          {bowl.popular && <Star className="h-4 w-4 text-[#e4d699] fill-[#e4d699]" />}
                          <span className="text-[#e4d699]">{bowl.price} kr</span>
                          <ChevronRight className="h-4 w-4 text-white/50" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right side - Bowl details */}
          <div className="w-full md:w-2/3 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedBowl ? (
                <motion.div
                  key={selectedBowl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  <div className="relative h-48 md:h-64 overflow-hidden">
                    <img
                      src={selectedBowl.image || "/placeholder.svg"}
                      alt={selectedBowl.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {selectedBowl.popular && <Badge className="bg-[#e4d699] text-black">Populär</Badge>}
                          {selectedBowl.spicyLevel > 0 && (
                            <Badge className="bg-red-500/80 text-white">
                              {selectedBowl.spicyLevel > 1 ? "Kryddig" : "Lätt kryddad"}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-black/30 border-white/20 text-white/80">
                            {categories.find((c) => c.id === selectedBowl.category)?.label}
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold">{selectedBowl.name}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#e4d699]">{selectedBowl.price} kr</span>
                        {selectedBowl.spicyLevel > 0 && (
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-white/60">Kryddnivå:</span>
                            {renderSpicyLevel(selectedBowl.spicyLevel)}
                          </div>
                        )}
                      </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                      <TabsList className="bg-black/30 border border-[#e4d699]/20 mb-4">
                        <TabsTrigger
                          value="info"
                          className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
                        >
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

                      <TabsContent value="info" className="flex-grow flex flex-col">
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-2">Beskrivning</h3>
                          <p className="text-white/80">{selectedBowl.description}</p>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-2">Ingredienser</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedBowl.ingredients.map((ingredient, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-black/30 border-[#e4d699]/20 text-white/80"
                              >
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="nutrition" className="flex-grow">
                        <div className="bg-black/30 border border-[#e4d699]/10 rounded-lg p-4 mb-4">
                          <h3 className="text-lg font-medium mb-4">Näringsvärde</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-black/40 rounded-lg">
                              <p className="text-sm text-white/60">Kalorier</p>
                              <p className="text-xl font-bold text-[#e4d699]">
                                {selectedBowl.nutritionalInfo.calories}
                              </p>
                              <p className="text-xs text-white/40">kcal</p>
                            </div>
                            <div className="text-center p-3 bg-black/40 rounded-lg">
                              <p className="text-sm text-white/60">Protein</p>
                              <p className="text-xl font-bold text-[#e4d699]">{selectedBowl.nutritionalInfo.protein}</p>
                              <p className="text-xs text-white/40">g</p>
                            </div>
                            <div className="text-center p-3 bg-black/40 rounded-lg">
                              <p className="text-sm text-white/60">Kolhydrater</p>
                              <p className="text-xl font-bold text-[#e4d699]">{selectedBowl.nutritionalInfo.carbs}</p>
                              <p className="text-xs text-white/40">g</p>
                            </div>
                            <div className="text-center p-3 bg-black/40 rounded-lg">
                              <p className="text-sm text-white/60">Fett</p>
                              <p className="text-xl font-bold text-[#e4d699]">{selectedBowl.nutritionalInfo.fat}</p>
                              <p className="text-xs text-white/40">g</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/50 italic">
                          Näringsvärden är ungefärliga och kan variera beroende på portionsstorlek och tillagning.
                        </p>
                      </TabsContent>

                      <TabsContent value="allergens" className="flex-grow">
                        <div className="bg-black/30 border border-[#e4d699]/10 rounded-lg p-4 mb-4">
                          <div className="flex items-start mb-4">
                            <AlertTriangle className="h-5 w-5 text-[#e4d699] mr-2 flex-shrink-0 mt-0.5" />
                            <h3 className="text-lg font-medium">Allergener</h3>
                          </div>
                          <div className="space-y-2">
                            {selectedBowl.allergens.map((allergen, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-[#e4d699] mr-2"></div>
                                <span className="text-white/80">{allergen}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-white/50 italic">
                          Vänligen informera personalen om du har några allergier eller särskilda kostbehov.
                        </p>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-auto pt-4 border-t border-[#e4d699]/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#e4d699]/30 rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-[#e4d699]/10"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-[#e4d699]/10"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90" onClick={handleAddToCart}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Lägg till i kundvagn ({quantity * selectedBowl.price} kr)
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#e4d699]/10 flex items-center justify-center mb-4">
                    <ChevronRight className="h-6 w-6 text-[#e4d699]" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Välj en Poké Bowl</h3>
                  <p className="text-white/60 max-w-md">
                    Välj en Poké Bowl från menyn till vänster för att se detaljerad information om rätten.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

