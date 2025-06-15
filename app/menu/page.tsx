"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedText, AnimatedCard } from "@/components/ui-components"
import { FloatingDock } from "@/components/floating-dock"
import { motion, AnimatePresence } from "framer-motion"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { FoodItemModal, type FoodItemDetails } from "@/components/food-item-modal"
import { Info, MapPin } from "lucide-react"
import { useLocation } from "@/contexts/LocationContext"

// Complete menu data with added nutritional and allergen information
const menuData = {
  rolls: [
    {
      id: 1,
      name: "California Roll",
      description:
        "En klassisk rulle där krispig gurka, krämig avokado och en lätt söt calimix kombineras för att skapa en fräsch och välbalanserad smakupplevelse som lockar både öga och gom.",
      price: 109,
      image: "/Meny-bilder/california roll.jpg",
      popular: true,
      ingredients: ["Ris", "Gurka", "Avokado", "Calimix", "Nori"],
      allergens: ["Skaldjur", "Sesam", "Soja"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 320,
        protein: 7,
        carbs: 45,
        fat: 12,
      },
      category: "Sushi",
    },
    {
      id: 2,
      name: "Salmon Roll",
      description:
        "Färskost, avokado, gurka och delikat lax möts i denna rulle som erbjuder en harmonisk blandning av mjuka och friska smaker – en riktig klassiker med en modern twist.",
      price: 115,
      image:
        "https://img.freepik.com/free-photo/closeup-shot-sushi-roll-black-stone-plate_181624-22537.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Ris", "Lax", "Färskost", "Avokado", "Gurka", "Nori"],
      allergens: ["Fisk", "Mjölk", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 350,
        protein: 12,
        carbs: 42,
        fat: 14,
      },
      category: "Sushi",
    },
    {
      id: 3,
      name: "Shrimp Roll",
      description:
        "En smakrik rulle fylld med färskost, avokado, gurka, sockerärta och saftiga räkor. Varje tugga ger en härlig mix av krispighet och lenhet, perfekt för den äventyrlige.",
      price: 129,
      image: "/Meny-bilder/shrimp roll.jpg",
      popular: false,
      ingredients: ["Ris", "Räkor", "Färskost", "Avokado", "Gurka", "Sockerärta", "Nori"],
      allergens: ["Skaldjur", "Mjölk", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 330,
        protein: 14,
        carbs: 40,
        fat: 12,
      },
      category: "Sushi",
    },
    {
      id: 4,
      name: "Veggo Roll",
      description:
        "En grönare variant med gurka, färskost, avokado, tofu och inari. Denna rulle är speciellt framtagen för dig som vill ha ett vegetariskt alternativ utan att kompromissa med smak och fräschhet.",
      price: 109,
      image:
        "https://img.freepik.com/free-photo/closeup-shot-delicious-sushi-roll-with-seasonings-white-background_181624-44235.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: false,
      ingredients: ["Ris", "Gurka", "Färskost", "Avokado", "Tofu", "Inari", "Nori"],
      allergens: ["Mjölk", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 290,
        protein: 8,
        carbs: 44,
        fat: 10,
      },
      category: "Vegetariskt",
    },
    {
      id: 5,
      name: "Vegan Roll",
      description:
        "Helt växtbaserad med gurka, avokado, sockerärtor, tofu och inari. En lätt och smakfull rulle som visar att veganskt kan vara både kreativt och utsökt, med en naturlig balans mellan smaker.",
      price: 109,
      image: "/Meny-bilder/vegan roll.jpg",
      popular: false,
      ingredients: ["Ris", "Gurka", "Avokado", "Sockerärtor", "Tofu", "Inari", "Nori"],
      allergens: ["Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 270,
        protein: 7,
        carbs: 45,
        fat: 8,
      },
      category: "Veganskt",
    },
    {
      id: 6,
      name: "Crazy Salmon",
      description:
        "En rulle med en oväntad twist: krispig textur från sockerärta och avokado, blandat med färskost och toppad med en flamberad laxröra. En spännande kombination som utmanar de traditionella sushismakerna.",
      price: 135,
      image: "/Meny-bilder/crazy salmon.png",
      popular: true,
      ingredients: ["Ris", "Lax", "Färskost", "Avokado", "Sockerärta", "Nori", "Flamberad laxröra"],
      allergens: ["Fisk", "Mjölk", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 380,
        protein: 16,
        carbs: 40,
        fat: 16,
      },
      spicyLevel: 1,
      category: "Sushi",
    },
    {
      id: 7,
      name: "Crazy Shrimp",
      description:
        "Här möts krispighet och tradition – en rulle med avokado, sockerärta och färskost som avslutas med en flamberad räkröra. En djärv och smakrik kreation som garanterat överraskar.",
      price: 135,
      image: "/Meny-bilder/magic shrimp2.png",
      popular: false,
      ingredients: ["Ris", "Räkor", "Färskost", "Avokado", "Sockerärta", "Nori", "Flamberad räkröra"],
      allergens: ["Skaldjur", "Mjölk", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 360,
        protein: 18,
        carbs: 38,
        fat: 15,
      },
      spicyLevel: 1,
      category: "Sushi",
    },
    {
      id: 8,
      name: "Avokado Love",
      description:
        "En hyllning till avokadon med friterad räka, gurka och färskost. Denna rulle erbjuder en lyxig mix av krämighet och fräschhet, perfekt för dig som älskar en mjuk, rik smak.",
      price: 135,
      image:
        "https://img.freepik.com/free-photo/rice-sushi-with-avacado_140725-1003.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: false,
      ingredients: ["Ris", "Friterad räka", "Gurka", "Färskost", "Avokado", "Nori"],
      allergens: ["Skaldjur", "Mjölk", "Gluten", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 390,
        protein: 15,
        carbs: 42,
        fat: 18,
      },
      category: "Sushi",
    },
    {
      id: 9,
      name: "Magic Tempura",
      description:
        "En magisk kombination av sockerärta, avokado och färskost, toppad med lax. Du kan även välja att flambera laxen för en extra dimension, vilket ger en både krispig och saftig upplevelse.",
      price: 135,
      image: "/Meny-bilder/magic tempura.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Färskost", "Avokado", "Sockerärta", "Nori", "Tempura"],
      allergens: ["Fisk", "Mjölk", "Gluten", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 410,
        protein: 16,
        carbs: 44,
        fat: 19,
      },
      category: "Sushi",
    },
    {
      id: 10,
      name: "Rainbow Roll",
      description:
        "En färgglad rulle med calimix, gurka och avokado, som kompletteras med en blandning av lax, extra avokado och räka. Varje bit är en visuell och smakfull explosion som får regnbågen att dansa på din tunga.",
      price: 129,
      image: "/Meny-bilder/rainbow roll.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Räka", "Calimix", "Gurka", "Avokado", "Nori"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 370,
        protein: 15,
        carbs: 42,
        fat: 16,
      },
      category: "Sushi",
    },
    {
      id: 11,
      name: "Magic Shrimp",
      description:
        "En rulle där avokado och färskost möter friterad räka, med extra räka på toppen för att ge en extra smakdimension. En perfekt kombination av krispigt och mjukt, som verkligen förtrollar.",
      price: 135,
      image: "/Meny-bilder/magic shrimp.jpg",
      popular: false,
      ingredients: ["Ris", "Friterad räka", "Färskost", "Avokado", "Nori", "Extra räka"],
      allergens: ["Skaldjur", "Mjölk", "Gluten", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 400,
        protein: 18,
        carbs: 40,
        fat: 18,
      },
      category: "Sushi",
    },
  ],
  friedRolls: [
    {
      id: 1,
      name: "Salmon",
      description:
        "Friterade maki med en krispig yta, fyllda med avokado, färskost och lax. En modern tolkning av klassisk sushi där den extra crunch ger en unik textur.",
      price: 139,
      image: "/Meny-bilder/helfriterad salmon.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Färskost", "Avokado", "Nori", "Tempuradeg"],
      allergens: ["Fisk", "Mjölk", "Gluten", "Soja", "Sesam", "Ägg"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 450,
        protein: 16,
        carbs: 48,
        fat: 22,
      },
      category: "Friterad Sushi",
    },
    {
      id: 2,
      name: "Chicken",
      description:
        "Saftig kyckling, avokado och färskost i en friterad maki som kombinerar möra och krispiga inslag. En spännande variant för den som söker något nytt men bekant.",
      price: 139,
      image: "/Meny-bilder/helfriterad chicken.png",
      popular: false,
      ingredients: ["Ris", "Kyckling", "Färskost", "Avokado", "Nori", "Tempuradeg"],
      allergens: ["Mjölk", "Gluten", "Soja", "Sesam", "Ägg"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 430,
        protein: 18,
        carbs: 46,
        fat: 20,
      },
      category: "Friterad Sushi",
    },
    {
      id: 3,
      name: "Beef",
      description:
        "Maki med marinerat yakiniku-kött, avokado och färskost. En rullad upplevelse som balanserar möra köttsmaker med en lätt krispighet från den friterade ytan.",
      price: 139,
      image: "/Meny-bilder/beef helfriterad maki.jpg",
      popular: false,
      ingredients: ["Ris", "Yakiniku-kött", "Färskost", "Avokado", "Nori", "Tempuradeg"],
      allergens: ["Mjölk", "Gluten", "Soja", "Sesam", "Ägg"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 460,
        protein: 20,
        carbs: 45,
        fat: 22,
      },
      spicyLevel: 1,
      category: "Friterad Sushi",
    },
  ],
  pokebowls: [
    {
      id: 1,
      name: "Spicy Beef",
      description:
        "En pokébowl med marinerat yakiniku-kött som kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En kryddig och färgglad rätt som levererar en explosion av smak i varje tugga.",
      price: 135,
      image: "/Meny-bilder/spicy beef.jpg",
      popular: true,
      ingredients: [
        "Yakiniku-kött",
        "Mango",
        "Sjögräs",
        "Gurka",
        "Kimchi",
        "Inlagd rödlök",
        "Edamame",
        "Salladsmix",
        "Ris",
      ],
      allergens: ["Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 520,
        protein: 28,
        carbs: 65,
        fat: 18,
      },
      spicyLevel: 2,
      category: "Poké Bowl",
    },
    {
      id: 2,
      name: "Crispy Chicken",
      description:
        "Friterad kyckling serverad med en rad fräscha ingredienser som mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En välbalanserad bowl där krispighet och fräschhet går hand i hand.",
      price: 135,
      image: "/Meny-bilder/crispy chicken.png",
      popular: true,
      ingredients: [
        "Friterad kyckling",
        "Mango",
        "Sjögräs",
        "Gurka",
        "Kimchi",
        "Inlagd rödlök",
        "Edamame",
        "Salladsmix",
        "Ris",
      ],
      allergens: ["Gluten", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 490,
        protein: 32,
        carbs: 58,
        fat: 15,
      },
      spicyLevel: 1,
      category: "Poké Bowl",
    },
    {
      id: 3,
      name: "Crazy Swede",
      description:
        "En oväntad mix av friterad kyckling och yakiniku-kött, som tillsammans blandas med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En rätt med djärva smaker och en härlig texturvariation.",
      price: 145,
      image: "/Meny-bilder/crispy chicken2.png",
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
        "Ris",
      ],
      allergens: ["Gluten", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 580,
        protein: 38,
        carbs: 62,
        fat: 22,
      },
      spicyLevel: 2,
      category: "Poké Bowl",
    },
    {
      id: 4,
      name: "Magic Lax",
      description:
        "Rå lax kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix i denna eleganta bowl. En fräsch och sofistikerad rätt som hyllar råvarornas naturliga smaker.",
      price: 149,
      image: "/Meny-bilder/magic lax.jpg",
      popular: true,
      ingredients: ["Rå lax", "Mango", "Sjögräs", "Gurka", "Kimchi", "Inlagd rödlök", "Edamame", "Salladsmix", "Ris"],
      allergens: ["Fisk", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 450,
        protein: 30,
        carbs: 52,
        fat: 16,
      },
      category: "Poké Bowl",
    },
    {
      id: 5,
      name: "Lemon Shrimp",
      description:
        "Friterade tempuraräkor serverade med en uppfriskande mix av mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. Den subtila citronnoten lyfter rätten till nya höjder.",
      price: 135,
      image: "/Meny-bilder/lemon shrimp.jpg",
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
        "Ris",
        "Citron",
      ],
      allergens: ["Skaldjur", "Gluten", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 470,
        protein: 26,
        carbs: 60,
        fat: 14,
      },
      category: "Poké Bowl",
    },
    {
      id: 6,
      name: "Vegan Bowl",
      description:
        "En helt växtbaserad bowl med tofu inari, kombinerat med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En näringsrik och färgstark rätt som bevisar att veganskt kan vara både mättande och inspirerande.",
      price: 129,
      image: "/Meny-bilder/vegan bowl.jpg",
      popular: false,
      ingredients: [
        "Tofu inari",
        "Mango",
        "Sjögräs",
        "Gurka",
        "Kimchi",
        "Inlagd rödlök",
        "Edamame",
        "Salladsmix",
        "Ris",
      ],
      allergens: ["Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 420,
        protein: 18,
        carbs: 68,
        fat: 12,
      },
      category: "Veganskt",
    },
  ],
  nigiriCombos: [
    {
      id: 1,
      name: "Nigiri Mix 8 Bitar",
      description:
        "8 bitar med en kockutvald blandning av nigiri, där varje bit speglar en unik kombination av färska ingredienser. En perfekt introduktion till vår nigiri-fusion.",
      price: 109,
      image: "/Meny-bilder/nigiri mix 8.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Räka", "Avokado", "Tofu", "Tamago"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 380,
        protein: 18,
        carbs: 50,
        fat: 10,
      },
      category: "Nigiri",
    },
    {
      id: 2,
      name: "Nigiri Mix 14 Bitar",
      description:
        "En generös sats med 14 bitar där kockens kreativitet och passion går igenom i varje detalj. En rik variation som passar den som vill uppleva allt på en gång.",
      price: 169,
      image: "/Meny-bilder/nigiri mix 8.jpg",
      popular: false,
      ingredients: ["Ris", "Lax", "Räka", "Avokado", "Tofu", "Tamago", "Tonfisk", "Inari"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 620,
        protein: 32,
        carbs: 80,
        fat: 18,
      },
      category: "Nigiri",
    },
    {
      id: 3,
      name: "Omakase Sushi – Munchies 8 Bitar",
      description:
        "En spännande mix av 4 maki och 4 nigiri, designad för att ta dig med på en smakresa där kockens rekommendationer lyser starkt. En perfekt balans mellan tradition och innovation.",
      price: 89,
      image: "/Meny-bilder/nigiri mix 8.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Räka", "Avokado", "Gurka", "Nori"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 320,
        protein: 14,
        carbs: 45,
        fat: 9,
      },
      category: "Mix",
    },
    {
      id: 4,
      name: "Single 12 Bitar",
      description:
        "Med 8 maki och 4 nigiri erbjuder denna sats en välavvägd kombination för den som önskar en mindre portion men med full smak. Varje bit är noggrant tillagad för optimal njutning.",
      price: 139,
      image: "/Meny-bilder/nigiri mix 8.jpg",
      popular: false,
      ingredients: ["Ris", "Lax", "Räka", "Avokado", "Gurka", "Nori"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam"],
      preparationTime: "20-25 min",
      nutritionalInfo: {
        calories: 480,
        protein: 22,
        carbs: 65,
        fat: 14,
      },
      category: "Mix",
    },
    {
      id: 5,
      name: "Hungry 16 Bitar",
      description:
        "8 maki och 8 nigiri i en sats som är gjord för den stora sushilusten. En mångsidig blandning som ger dig möjlighet att njuta av en rad olika smaker i varje tugga.",
      price: 199,
      image: "/Meny-bilder/nigiri mix 8.jpg",
      popular: true,
      ingredients: ["Ris", "Lax", "Räka", "Avokado", "Gurka", "Nori", "Tonfisk", "Tamago"],
      allergens: ["Fisk", "Skaldjur", "Soja", "Sesam", "Ägg"],
      preparationTime: "25-30 min",
      nutritionalInfo: {
        calories: 640,
        protein: 32,
        carbs: 85,
        fat: 18,
      },
      category: "Mix",
    },
  ],
  exoticDelicacies: [
    {
      id: 1,
      name: "Sashimi Lax 10 Bitar",
      description:
        "Tunna, färska bitar av lax som framhäver fiskens rena och delikata smak. En elegant rätt som är lika visuellt tilltalande som den är smakfull.",
      price: 139,
      image: "/Meny-bilder/sashimi lax.jpg",
      popular: true,
      ingredients: ["Lax"],
      allergens: ["Fisk"],
      preparationTime: "10-15 min",
      nutritionalInfo: {
        calories: 280,
        protein: 42,
        carbs: 0,
        fat: 12,
      },
      category: "Sashimi",
    },
    {
      id: 2,
      name: "Yakiniku",
      description:
        "Skivad och marinerad biff serverad med ris, salladsmix, chilimajonnäs och teriyaki. En rätt som förenar det bästa från japansk och västerländsk matlagning för en rik och intensiv smakupplevelse.",
      price: 139,
      image: "/Meny-bilder/spicy beef.jpg",
      popular: false,
      ingredients: ["Marinerad biff", "Ris", "Salladsmix", "Chilimajonnäs", "Teriyakisås"],
      allergens: ["Soja", "Sesam", "Ägg"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 520,
        protein: 32,
        carbs: 58,
        fat: 18,
      },
      spicyLevel: 1,
      category: "Varmrätter",
    },
    {
      id: 3,
      name: "EbiFry",
      description:
        "Tempura-friterade räkor med ris, teriyakisås, chilimajonnäs, inlagd rödlök, gurka och salladsmix. En harmonisk rätt där krispighet möter en fyllig såsig rikedom.",
      price: 139,
      image: "/Meny-bilder/shrimptempura.jpg",
      popular: true,
      ingredients: ["Tempuraräkor", "Ris", "Teriyakisås", "Chilimajonnäs", "Inlagd rödlök", "Gurka", "Salladsmix"],
      allergens: ["Skaldjur", "Gluten", "Soja", "Sesam", "Ägg"],
      preparationTime: "15-20 min",
      nutritionalInfo: {
        calories: 490,
        protein: 24,
        carbs: 62,
        fat: 16,
      },
      spicyLevel: 1,
      category: "Varmrätter",
    },
  ],
  kidsMenu: [
    {
      id: 1,
      name: "8 Bitar Risbollar – Helt Naturella",
      description:
        "Små, naturella risbollar som är anpassade för de små. En enkel och smakfull rätt som ger energi och glädje.",
      price: 39,
      image: "/Meny-bilder/8 risbollar natruella .jpg",
      popular: false,
      ingredients: ["Ris"],
      allergens: [],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 180,
        protein: 3,
        carbs: 40,
        fat: 0,
      },
      category: "Barnmeny",
    },
    {
      id: 2,
      name: "Ris, Kyckling, Gurka & Mango",
      description:
        "En balanserad rätt med mjuka risbitar, tärnad kyckling, färsk gurka och söt mango. Speciellt framtagen för att passa barns smaklökar med en lätt och näringsrik komposition.",
      price: 75,
      image: "/Meny-bilder/crispy kid.png",
      popular: true,
      ingredients: ["Ris", "Kyckling", "Gurka", "Mango"],
      allergens: [],
      preparationTime: "10-15 min",
      nutritionalInfo: {
        calories: 280,
        protein: 18,
        carbs: 45,
        fat: 4,
      },
      category: "Barnmeny",
    },
  ],
  sides: [
    {
      id: 1,
      name: "Wakamesallad & Sjögräs",
      description:
        "En frisk sallad med wakame och sjögräs som ger en lätt och uppfriskande start på måltiden. Perfekt som förrätt eller sidorätt för att väcka aptiten.",
      price: 45,
      image:
        "https://img.freepik.com/free-photo/top-view-delicious-seaweed-eating_23-2150695253.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Wakame", "Sjögräs", "Sesamolja", "Sesamfrön"],
      allergens: ["Soja", "Sesam"],
      preparationTime: "5 min",
      nutritionalInfo: {
        calories: 70,
        protein: 2,
        carbs: 8,
        fat: 3,
      },
      category: "Tillbehör",
    },
    {
      id: 2,
      name: "Steamed Edamame Kryddad",
      description:
        "Ångade edamamebönor med en kryddig touch som sätter extra sting på smaken. En favorit bland sushiälskare som älskar en liten extra kick.",
      price: 45,
      image: "/Meny-bilder/edamame bönor.jpg",
      popular: false,
      ingredients: ["Edamamebönor", "Salt", "Chili"],
      allergens: ["Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 120,
        protein: 11,
        carbs: 10,
        fat: 5,
      },
      spicyLevel: 2,
      category: "Tillbehör",
    },
    {
      id: 3,
      name: "Steamed Edamame Saltad",
      description:
        "Klassiska ångade edamamebönor med en lagom dos salt för att framhäva deras naturliga smak. Enkel men oemotståndlig i sin renhet.",
      price: 45,
      image: "/Meny-bilder/edamame bönor.jpg",
      popular: true,
      ingredients: ["Edamamebönor", "Salt"],
      allergens: ["Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 120,
        protein: 11,
        carbs: 10,
        fat: 5,
      },
      category: "Tillbehör",
    },
  ],
  sauces: [
    {
      id: 1,
      name: "Chilimajonäs",
      description:
        "En krämig sås med en tydlig kryddighet som lyfter varje rätt med en extra dos hetta. En favoritsmak för den äventyrlige.",
      price: 15,
      image:
        "https://img.freepik.com/free-photo/chipotle-sauce-spices-wooden-table_123827-35705.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Majonnäs", "Chili", "Vitlök", "Lime"],
      allergens: ["Ägg"],
      preparationTime: "Färdig att servera",
      nutritionalInfo: {
        calories: 120,
        protein: 0,
        carbs: 1,
        fat: 13,
      },
      spicyLevel: 2,
      category: "Såser",
    },
    {
      id: 2,
      name: "Söt Sojasås",
      description:
        "En söt och fyllig sojasås som ger en harmonisk smakförstärkning till dina rätter. En klassiker med en modern touch.",
      price: 15,
      image:
        "https://img.freepik.com/free-photo/bowl-with-sauce-sushi_23-2148631186.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Sojasås", "Socker", "Mirin", "Ingefära"],
      allergens: ["Soja", "Vete"],
      preparationTime: "Färdig att servera",
      nutritionalInfo: {
        calories: 45,
        protein: 1,
        carbs: 10,
        fat: 0,
      },
      category: "Såser",
    },
  ],
  drinks: [
    {
      id: 1,
      name: "Coca-Cola 33 cl",
      description: "En klassisk, bubblande läskedryck med en tidlös smak som kompletterar måltiden perfekt.",
      price: 20,
      image: "/Meny-bilder/coca-cola.jpg",
      popular: true,
      ingredients: ["Kolsyrat vatten", "Socker", "Färgämne", "Smakämnen"],
      allergens: [],
      nutritionalInfo: {
        calories: 139,
        protein: 0,
        carbs: 35,
        fat: 0,
      },
      category: "Drycker",
    },
    {
      id: 2,
      name: "Ramlösa 33 cl",
      description: "Naturligt kolsyrat vatten med en ren och uppfriskande smak, ett hälsosamt val för törstsläckning.",
      price: 20,
      image: "/Meny-bilder/ramlösa.jpg",
      popular: true,
      ingredients: ["Kolsyrat källvatten", "Mineraler"],
      allergens: [],
      nutritionalInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      category: "Drycker",
    },
    {
      id: 3,
      name: "Pacha – Fruktiga Favoriter",
      description:
        "En läskedryck med en mix av fruktiga smaker som Peach, Mojito, Strawberry, Lychee, Apple och Melon – en festlig och uppfriskande dryck som lyfter hela måltiden.",
      price: 25,
      image: "/Meny-bilder/ramlösa.jpg",
      popular: true,
      ingredients: ["Kolsyrat vatten", "Fruktjuice", "Socker", "Naturliga aromer"],
      allergens: [],
      nutritionalInfo: {
        calories: 120,
        protein: 0,
        carbs: 30,
        fat: 0,
      },
      category: "Drycker",
    },
  ],
  nigiriPairs: [
    {
      id: 1,
      name: "Lax",
      description:
        "Två bitar med färsk, delikat lax som erbjuder en rik och naturlig smak, en självklar favorit bland nigiriälskare.",
      price: 30,
      image: "/Meny-bilder/1 par lax.jpg",
      popular: true,
      ingredients: ["Ris", "Lax"],
      allergens: ["Fisk", "Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 70,
        protein: 6,
        carbs: 10,
        fat: 2,
      },
      category: "Nigiri",
    },
    {
      id: 2,
      name: "Räka",
      description:
        "Två bitar med klassiska räkor, noggrant utvalda för sin fräschör, som tillsammans skapar en harmonisk smakupplevelse.",
      price: 30,
      image: "/Meny-bilder/1 par räka.jpg",
      popular: true,
      ingredients: ["Ris", "Räka"],
      allergens: ["Skaldjur", "Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 65,
        protein: 7,
        carbs: 10,
        fat: 1,
      },
      category: "Nigiri",
    },
    {
      id: 3,
      name: "Avokado",
      description:
        "Två bitar med krämig avokado som ger en len och fyllig konsistens, ett perfekt komplement till de övriga nigiribitarna.",
      price: 30,
      image:
        "https://img.freepik.com/free-photo/seafood-background-avocados-food-healthy_1203-4340.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Ris", "Avokado"],
      allergens: ["Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 60,
        protein: 2,
        carbs: 10,
        fat: 3,
      },
      category: "Nigiri",
    },
    {
      id: 4,
      name: "Flamberad Lax",
      description:
        "Två bitar med flamberad lax, vars lätt brända yta tillför en extra dimension av smak och textur – en modern twist på traditionell nigiri.",
      price: 35,
      image:
        "https://img.freepik.com/free-photo/delicious-cooked-salmon-fish_23-2148708707.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
      popular: true,
      ingredients: ["Ris", "Lax", "Teriyakisås"],
      allergens: ["Fisk", "Soja"],
      preparationTime: "5-10 min",
      nutritionalInfo: {
        calories: 75,
        protein: 6,
        carbs: 10,
        fat: 2,
      },
      category: "Nigiri",
    },
  ],
}

// Map category names to display names
const categoryNames = {
  rolls: "Mois Rolls",
  friedRolls: "Helfriterade Maki",
  pokebowls: "Pokébowls",
  nigiriCombos: "Nigiri Combo",
  exoticDelicacies: "Exotiska Delikatesser",
  kidsMenu: "Barnmeny",
  sides: "Smått & Gott",
  sauces: "Såser",
  drinks: "Drycker",
  nigiriPairs: "Nigiri i Par",
}

export default function MenuPage() {
  const { selectedLocation } = useLocation()
  const [activeTab, setActiveTab] = useState("rolls")
  const [isFloatingDockVisible, setIsFloatingDockVisible] = useState(true)
  const [previousTab, setPreviousTab] = useState("rolls")
  const [scrollY, setScrollY] = useState(0)
  const [selectedItem, setSelectedItem] = useState<FoodItemDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Define which categories are available for Ystad (food truck)
  const ystadAvailableCategories = ["pokebowls", "drinks", "sauces"]
  
  // Filter categories based on location
  const getAvailableCategories = () => {
    if (selectedLocation?.id === "ystad") {
      return Object.entries(categoryNames).filter(([id]) => 
        ystadAvailableCategories.includes(id)
      )
    }
    return Object.entries(categoryNames)
  }

  // Create dock items from available category names
  const dockItems = Object.entries(categoryNames).map(([id, label]) => ({
    id,
    label,
    disabled: selectedLocation?.id === "ystad" && !ystadAvailableCategories.includes(id)
  }))

  // Handle scroll to control dock visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Show/hide floating dock based on scroll position
      if (window.scrollY > 300) {
        setIsFloatingDockVisible(true)
      } else {
        setIsFloatingDockVisible(true) // Always visible for now, change to false if you want it to hide at top
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setPreviousTab(activeTab)
    setActiveTab(category)
  }

  // Auto-switch to available category when location changes to Ystad
  useEffect(() => {
    if (selectedLocation?.id === "ystad" && !ystadAvailableCategories.includes(activeTab)) {
      setActiveTab("pokebowls") // Default to pokebowls for Ystad
    }
  }, [selectedLocation, activeTab])

  // Handle opening the modal with item details
  const handleOpenItemDetails = (item: FoodItemDetails) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  return (
    <div className="pt-20 md:pt-24 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <AnimatedText text="Vår Meny" element="h1" className="text-4xl md:text-5xl font-bold mb-4" />
          <AnimatedText
            text="Förnyad och förbättrad"
            element="p"
            className="text-lg text-white/80 max-w-2xl mx-auto"
            delay={0.2}
          />
        </div>

        {/* Ystad Location Info */}
        {selectedLocation?.id === "ystad" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <div className="bg-[#e4d699]/10 border border-[#e4d699]/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[#e4d699]" />
                <h3 className="text-lg font-semibold">Ystad Food Truck</h3>
              </div>
              <p className="text-white/80 text-sm">
                Vår food truck i Ystad specialiserar sig på <strong>Poké Bowls</strong>. 
                Här erbjuder vi ett begränsat men noggrant utvalt sortiment av våra populäraste poké bowls, 
                drycker och såser. För vårt fullständiga sushi-sortiment, besök oss i Malmö eller Trelleborg.
              </p>
            </div>
          </motion.div>
        )}

        {/* Floating Dock Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isFloatingDockVisible ? 1 : 0,
            y: isFloatingDockVisible ? 0 : 20,
          }}
          transition={{ duration: 0.3 }}
          className="sticky top-16 md:top-24 z-40 px-1"
        >
          <FloatingDock items={dockItems} activeItem={activeTab} onItemClick={handleCategoryChange} />
        </motion.div>

        {/* Menu Content */}
        <div className="mt-8">
          {Object.entries(menuData)
            .filter(([category]) => {
              // Filter categories based on location
              if (selectedLocation?.id === "ystad") {
                return ystadAvailableCategories.includes(category)
              }
              return true
            })
            .map(([category, items]) => (
            <AnimatePresence key={category} mode="wait">
              {activeTab === category && (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                      <AnimatedCard key={item.id} delay={index * 0.1} className="h-full">
                        <Card className="overflow-hidden h-full flex flex-col border border-[#e4d699]/20">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={item.image || "/placeholder.svg?height=300&width=400"}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                            {item.popular && (
                              <Badge className="absolute top-2 right-2 bg-[#e4d699] text-black">Populär</Badge>
                            )}
                          </div>
                          <CardContent className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-semibold">{item.name}</h3>
                              <div className="text-lg font-medium text-[#e4d699]">{item.price} kr</div>
                            </div>
                            <p className="text-white/70 text-sm mb-4 flex-grow">{item.description}</p>
                            <div className="mt-auto flex justify-between items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                                onClick={() => handleOpenItemDetails(item)}
                              >
                                <Info className="mr-2 h-4 w-4" />
                                Mer info
                              </Button>
                              <AddToCartButton
                                product={{
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image,
                                  category: category,
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </AnimatedCard>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Food Item Modal */}
      <FoodItemModal open={isModalOpen} onOpenChange={setIsModalOpen} item={selectedItem} />
    </div>
  )
}

