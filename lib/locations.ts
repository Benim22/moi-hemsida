export interface Location {
  id: string
  name: string
  displayName: string
  address: string
  phone: string
  email: string
  hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  services: string[]
  menu: string
  deliveryServices: string[]
  description: string
  image: string
  coordinates: {
    lat: number
    lng: number
  }
  features: string[]
}

export const locations: Location[] = [
  {
    id: "trelleborg",
    name: "Trelleborg",
    displayName: "Moi Sushi Trelleborg",
    address: "Corfitz-Beck-Friisgatan 5B, 231 43 Trelleborg",
    phone: "0410-281 10",
    email: "trelleborg@moisushi.se",
    hours: {
      weekdays: "11.00 – 21.00",
      saturday: "12.00 – 21.00",
      sunday: "15.00 – 21.00",
    },
    services: ["delivery", "pickup", "dine-in"],
    menu: "full",
    deliveryServices: ["Foodora"],
    description: "Vår första och flaggskeppsrestaurang i hjärtat av Trelleborg. Här serverar vi hela vårt sortiment av färsk sushi, poké bowls och specialrullar i en mysig och välkomnande miljö.",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
    coordinates: { lat: 55.3755, lng: 13.1567 },
    features: ["Fullständig meny", "Dine-in", "Leverans", "Avhämtning", "Catering"]
  },
  {
    id: "ystad",
    name: "Ystad",
    displayName: "Moi Sushi Food Truck Ystad",
    address: "Österportstorg, 271 41 Ystad",
    phone: "076-059 84 09",
    email: "ystad@moisushi.se",
    hours: {
      weekdays: "11.00 – 19.00",
      saturday: "12.00 – 19.00",
      sunday: "12.00 – 18.00",
    },
    services: ["delivery", "pickup"],
    menu: "pokebowl",
    deliveryServices: ["Foodora"],
    description: "Vår mobila food truck som serverar färska och näringsrika poké bowls vid Ystads vackra hamn. Perfekt för en snabb och hälsosam måltid med havsutsikt.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    coordinates: { lat: 55.4297, lng: 13.8204 },
    features: ["Poké Bowls", "Food Truck", "Leverans", "Avhämtning", "Havsutsikt"]
  },
  {
    id: "malmo",
    name: "Malmö",
    displayName: "Moi Sushi Malmö",
    address: "Södra Förstadsgatan 40, 211 43 Malmö",
    phone: "040-842 52",
    email: "malmo@moisushi.se",
    hours: {
      weekdays: "11.00 – 21.00",
      saturday: "12.00 – 21.00",
      sunday: "15.00 – 21.00",
    },
    services: ["delivery", "pickup", "dine-in"],
    menu: "full",
    deliveryServices: ["Foodora"],
    description: "Vår nyaste restaurang i Malmös pulserende centrum. Modern design möter traditionell japansk matkultur med vårt kompletta utbud av sushi och poké bowls.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    coordinates: { lat: 55.6051, lng: 13.0040 },
    features: ["Fullständig meny", "Modern design", "Leverans", "Avhämtning", "Dine-in"]
  }
] 