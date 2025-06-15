import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extendedMenuItems } from './menu-data-extended';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  ingredients?: string[];
  locationAvailable?: ('malmo' | 'trelleborg' | 'ystad')[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface MenuStore {
  items: MenuItem[];
  categories: MenuCategory[];
  selectedCategory: string;
  searchQuery: string;
  selectedLocation: 'malmo' | 'trelleborg' | 'ystad' | 'all';
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: 'malmo' | 'trelleborg' | 'ystad' | 'all') => void;
  getFilteredItems: () => MenuItem[];
  getItemsByCategory: (category: string) => MenuItem[];
  getPopularItems: () => MenuItem[];
}

// Menykategorier
const categories: MenuCategory[] = [
  {
    id: 'all',
    name: 'Alla',
    description: 'Visa alla rätter',
    icon: 'Grid'
  },
  {
    id: 'mois-rolls',
    name: 'Mois Rolls',
    description: 'Kreativa Rullar',
    icon: 'Sushi'
  },
  {
    id: 'helfriterade-maki',
    name: 'Helfriterade Maki',
    description: 'Friterade makirullar',
    icon: 'Flame'
  },
  {
    id: 'pokebowls',
    name: 'Poké Bowls',
    description: 'Färgsprakande Pokébowls',
    icon: 'Bowl'
  },
  {
    id: 'nigiri-combo',
    name: 'Nigiri Combo',
    description: 'Nigiri Fusion',
    icon: 'Fish'
  },
  {
    id: 'exotiska',
    name: 'Exotiska Delikatesser',
    description: 'Speciella läckerheter',
    icon: 'Star'
  },
  {
    id: 'barnmeny',
    name: 'Barnmenyer',
    description: 'Anpassat för de små',
    icon: 'Heart'
  },
  {
    id: 'smatt-gott',
    name: 'Smått Och Gott',
    description: 'Sidorätter och tillbehör',
    icon: 'Plus'
  },
  {
    id: 'saser',
    name: 'Våra Såser',
    description: 'Smakexplosion',
    icon: 'Droplet'
  },
  {
    id: 'soppa',
    name: 'Soppa',
    description: 'Varma soppor',
    icon: 'Soup'
  },
  {
    id: 'nigiri-par',
    name: 'Nigiri (1 par)',
    description: 'Enskilda nigiri',
    icon: 'ChefHat'
  },
  {
    id: 'drycker',
    name: 'Drycker',
    description: 'Uppfriskande Drycker',
    icon: 'Coffee'
  }
];

// Komplett menydata - Moi Meny Förnyad och förbättrad
const menuItems: MenuItem[] = [
  // MOIS ROLLS – Kreativa Rullar
  {
    id: 'california-roll',
    name: 'California Roll',
    description: 'En klassisk rulle där krispig gurka, krämig avokado och en lätt söt calimix kombineras för att skapa en fräsch och välbalanserad smakupplevelse som lockar både öga och gom.',
    price: 109,
    image: '/menu-images/california roll.jpg',
    category: 'mois-rolls',
    isPopular: true,
    ingredients: ['Gurka', 'Avokado', 'Calimix'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'salmon-roll',
    name: 'Salmon Roll',
    description: 'Färskost, avokado, gurka och delikat lax möts i denna rulle som erbjuder en harmonisk blandning av mjuka och friska smaker – en riktig klassiker med en modern twist.',
    price: 115,
    image: '/menu-images/salmon roll.jpg',
    category: 'mois-rolls',
    isPopular: true,
    ingredients: ['Färskost', 'Avokado', 'Gurka', 'Lax'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'shrimp-roll',
    name: 'Shrimp Roll',
    description: 'En smakrik rulle fylld med färskost, avokado, gurka, sockerärta och saftiga räkor. Varje tugga ger en härlig mix av krispighet och lenhet, perfekt för den äventyrlige.',
    price: 129,
    image: '/menu-images/shrimp roll.jpg',
    category: 'mois-rolls',
    ingredients: ['Färskost', 'Avokado', 'Gurka', 'Sockerärta', 'Räka'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'veggo-roll',
    name: 'Veggo Roll',
    description: 'En grönare variant med gurka, färskost, avokado, tofu och inari. Denna rulle är speciellt framtagen för dig som vill ha ett vegetariskt alternativ utan att kompromissa med smak och fräschhet.',
    price: 109,
    image: '/menu-images/veggo roll.jpg',
    category: 'mois-rolls',
    isVegetarian: true,
    ingredients: ['Gurka', 'Färskost', 'Avokado', 'Tofu', 'Inari'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'vegan-roll',
    name: 'Vegan Roll',
    description: 'Helt växtbaserad med gurka, avokado, sockerärtor, tofu och inari. En lätt och smakfull rulle som visar att veganskt kan vara både kreativt och utsökt, med en naturlig balans mellan smaker.',
    price: 109,
    image: '/menu-images/vegan roll.jpg',
    category: 'mois-rolls',
    isVegetarian: true,
    ingredients: ['Gurka', 'Avokado', 'Sockerärtor', 'Tofu', 'Inari'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'crazy-salmon',
    name: 'Crazy Salmon',
    description: 'En rulle med en oväntad twist: krispig textur från sockerärta och avokado, blandat med färskost och toppad med en flamberad laxröra. En spännande kombination som utmanar de traditionella sushismakerna.',
    price: 135,
    image: '/menu-images/crazy salmon.png',
    category: 'mois-rolls',
    isPopular: true,
    ingredients: ['Sockerärta', 'Avokado', 'Färskost', 'Flamberad lax'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'crazy-shrimp',
    name: 'Crazy Shrimp',
    description: 'Här möts krispighet och tradition – en rulle med avokado, sockerärta och färskost som avslutas med en flamberad räkröra. En djärv och smakrik kreation som garanterat överraskar.',
    price: 135,
    image: '/menu-images/crazy shrimp.jpg',
    category: 'mois-rolls',
    ingredients: ['Avokado', 'Sockerärta', 'Färskost', 'Flamberad räka'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'avokado-love',
    name: 'Avokado Love',
    description: 'En hyllning till avokadon med friterad räka, gurka och färskost. Denna rulle erbjuder en lyxig mix av krämighet och fräschhet, perfekt för dig som älskar en mjuk, rik smak.',
    price: 135,
    image: '/menu-images/avokado love.jpg',
    category: 'mois-rolls',
    ingredients: ['Friterad räka', 'Gurka', 'Färskost', 'Extra avokado'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'magic-tempura',
    name: 'Magic Tempura',
    description: 'En magisk kombination av sockerärta, avokado och färskost, toppad med lax. Du kan även välja att flambera laxen för en extra dimension, vilket ger en både krispig och saftig upplevelse.',
    price: 135,
    image: '/menu-images/magic tempura.jpg',
    category: 'mois-rolls',
    ingredients: ['Sockerärta', 'Avokado', 'Färskost', 'Lax'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'rainbow-roll',
    name: 'Rainbow Roll',
    description: 'En färgglad rulle med calimix, gurka och avokado, som kompletteras med en blandning av lax, extra avokado och räka. Varje bit är en visuell och smakfull explosion som får regnbågen att dansa på din tunga.',
    price: 129,
    image: '/menu-images/rainbow roll.jpg',
    category: 'mois-rolls',
    isPopular: true,
    ingredients: ['Calimix', 'Gurka', 'Avokado', 'Lax', 'Räka'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'magic-shrimp',
    name: 'Magic Shrimp',
    description: 'En rulle där avokado och färskost möter friterad räka, med extra räka på toppen för att ge en extra smakdimension. En perfekt kombination av krispigt och mjukt, som verkligen förtrollar.',
    price: 135,
    image: '/menu-images/magic shrimp.jpg',
    category: 'mois-rolls',
    ingredients: ['Avokado', 'Färskost', 'Friterad räka', 'Extra räka'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // MOIS HELFRITERADE MAKI ROLLS
  {
    id: 'helfriterad-salmon',
    name: 'Salmon',
    description: 'Friterade maki med en krispig yta, fyllda med avokado, färskost och lax. En modern tolkning av klassisk sushi där den extra crunch ger en unik textur.',
    price: 139,
    image: '/menu-images/helfriterad salmon.jpg',
    category: 'helfriterade-maki',
    isPopular: true,
    ingredients: ['Avokado', 'Färskost', 'Lax', 'Friterat'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'helfriterad-chicken',
    name: 'Chicken',
    description: 'Saftig kyckling, avokado och färskost i en friterad maki som kombinerar möra och krispiga inslag. En spännande variant för den som söker något nytt men bekant.',
    price: 139,
    image: '/menu-images/helfriterad chicken.png',
    category: 'helfriterade-maki',
    ingredients: ['Kyckling', 'Avokado', 'Färskost', 'Friterat'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'helfriterad-beef',
    name: 'Beef',
    description: 'Maki med marinerat yakiniku-kött, avokado och färskost. En rullad upplevelse som balanserar möra köttsmaker med en lätt krispighet från den friterade ytan.',
    price: 139,
    image: '/menu-images/beef helfriterad maki.jpg',
    category: 'helfriterade-maki',
    ingredients: ['Yakiniku-kött', 'Avokado', 'Färskost', 'Friterat'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // Lägg till alla utökade menyobjekt
  ...extendedMenuItems,

  // SMÅTT OCH GOTT
  {
    id: 'wakame-sallad',
    name: 'Wakamesallad & Sjögräs',
    description: 'En frisk sallad med wakame och sjögräs som ger en lätt och uppfriskande start på måltiden. Perfekt som förrätt eller sidorätt för att väcka aptiten.',
    price: 45,
    image: '/menu-images/gyoza och wakame sallad.jpg',
    category: 'smatt-gott',
    isVegetarian: true,
    ingredients: ['Wakame', 'Sjögräs'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'edamame-kryddad',
    name: 'Steamed Edamame Kryddad',
    description: 'Ångade edamamebönor med en kryddig touch som sätter extra sting på smaken. En favorit bland sushiälskare som älskar en liten extra kick.',
    price: 45,
    image: '/menu-images/edamame bönor.jpg',
    category: 'smatt-gott',
    isVegetarian: true,
    isSpicy: true,
    ingredients: ['Edamame', 'Kryddor'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'edamame-saltad',
    name: 'Steamed Edamame Saltad',
    description: 'Klassiska ångade edamamebönor med en lagom dos salt för att framhäva deras naturliga smak. Enkel men oemotståndlig i sin renhet.',
    price: 45,
    image: '/menu-images/edamame bönor.jpg',
    category: 'smatt-gott',
    isVegetarian: true,
    ingredients: ['Edamame', 'Salt'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'avokai',
    name: 'Avokai',
    description: 'Två halvor av krämig avokado serverade med en smakrik laxröra. En elegant rätt som kombinerar friskhet med en mjuk, len konsistens.',
    price: 69,
    image: '/menu-images/avokai.jpg',
    category: 'smatt-gott',
    ingredients: ['Avokado', 'Laxröra'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'gyoza-kyckling',
    name: 'Gyoza Kyckling',
    description: '5 friterade dumplings fyllda med saftig kyckling och aromatiska kryddor. En spröd och smakfull upplevelse som lockar med både crunch och fyllighet.',
    price: 65,
    image: '/menu-images/gyoza och wakame sallad.jpg',
    category: 'smatt-gott',
    ingredients: ['Kyckling', 'Dumplings', '5 st'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'gyoza-vegansk',
    name: 'Gyoza Vegansk',
    description: '5 friterade dumplings med en växtbaserad fyllning, rik på smak och textur. Perfekt för dig som föredrar ett veganskt alternativ utan att kompromissa med smaken.',
    price: 65,
    image: '/menu-images/gyoza vegansk.jpg',
    category: 'smatt-gott',
    isVegetarian: true,
    ingredients: ['Växtbaserad fyllning', 'Dumplings', '5 st'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'gyoza-raka',
    name: 'Gyoza Räka',
    description: '5 friterade dumplings med en lätt och delikat räkinspiration. En rätt som kombinerar havets friskhet med en krispig yta.',
    price: 65,
    image: '/menu-images/gyoza raka.jpg',
    category: 'smatt-gott',
    ingredients: ['Räka', 'Dumplings', '5 st'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'shrimptempura',
    name: 'Shrimptempura',
    description: '5 friterade räkor med en luftig tempurabotten, serverade med en liten fräsch sallad. En underbar blandning av krispigt och mjukt som gör varje tugga speciell.',
    price: 75,
    image: '/menu-images/shrimptempura.jpg',
    category: 'smatt-gott',
    ingredients: ['Tempura räkor', 'Sallad', '5 st'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // SOPPA
  {
    id: 'miso-soppa',
    name: 'Misosoppa',
    description: 'En klassisk misosoppa med rik umamismak och en värmande känsla. Perfekt som en mjuk start eller avslutning på en måltid.',
    price: 39,
    image: '/menu-images/miso soppa.jpg',
    category: 'soppa',
    isVegetarian: true,
    ingredients: ['Miso', 'Tofu', 'Wakame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // SÅSER
  {
    id: 'chilimajonnas',
    name: 'Chilimajonäs',
    description: 'En krämig sås med en tydlig kryddighet som lyfter varje rätt med en extra dos hetta. En favoritsmak för den äventyrlige.',
    price: 15,
    image: '/menu-images/chilimajonnas.jpg',
    category: 'saser',
    isSpicy: true,
    ingredients: ['Chili', 'Majonnäs'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'sot-sojasas',
    name: 'Söt Sojasås',
    description: 'En söt och fyllig sojasås som ger en harmonisk smakförstärkning till dina rätter. En klassiker med en modern touch.',
    price: 15,
    image: '/menu-images/sot sojasas.jpg',
    category: 'saser',
    ingredients: ['Söt soja', 'Kryddor'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // NIGIRI (1 PAR)
  {
    id: 'nigiri-tofu',
    name: 'Tofu',
    description: 'Två bitar med mjuk tofu som erbjuder en mild, fyllig smak. Ett perfekt alternativ för dig som söker ett lättare inslag i din nigiri.',
    price: 30,
    image: '/menu-images/1 par tofu.png',
    category: 'nigiri-par',
    isVegetarian: true,
    ingredients: ['Tofu', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-tamago',
    name: 'Tamago (Omelett)',
    description: 'Två bitar av söt, fluffig omelett som smälter i munnen och ger en härlig kontrast till övriga nigiribitar.',
    price: 30,
    image: '/menu-images/1 par tamago.png',
    category: 'nigiri-par',
    isVegetarian: true,
    ingredients: ['Tamago', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-gurka',
    name: 'Gurka',
    description: 'Två krispiga bitar av färsk gurka som tillför en frisk och ren smak, vilket ger en fin balans i din nigiri-upplevelse.',
    price: 30,
    image: '/menu-images/1 par gurka.png',
    category: 'nigiri-par',
    isVegetarian: true,
    ingredients: ['Gurka', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-surimi',
    name: 'Surimi',
    description: 'Två bitar med ett mildt fiskbaserat alternativ, surimi, som är perfekt för dig som vill prova något annorlunda.',
    price: 30,
    image: '/menu-images/1 par surumi.jpg',
    category: 'nigiri-par',
    ingredients: ['Surimi', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-lax',
    name: 'Lax',
    description: 'Två bitar med färsk, delikat lax som erbjuder en rik och naturlig smak, en självklar favorit bland nigiriälskare.',
    price: 30,
    image: '/menu-images/1 par lax.jpg',
    category: 'nigiri-par',
    isPopular: true,
    ingredients: ['Lax', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-raka',
    name: 'Räka',
    description: 'Två bitar med klassiska räkor, noggrant utvalda för sin fräschör, som tillsammans skapar en harmonisk smakupplevelse.',
    price: 30,
    image: '/menu-images/1 par räka.jpg',
    category: 'nigiri-par',
    ingredients: ['Räka', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-avokado',
    name: 'Avokado',
    description: 'Två bitar med krämig avokado som ger en len och fyllig konsistens, ett perfekt komplement till de övriga nigiribitarna.',
    price: 30,
    image: '/menu-images/1 par avokado.png',
    category: 'nigiri-par',
    isVegetarian: true,
    ingredients: ['Avokado', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-flamberad-lax',
    name: 'Flamberad Lax',
    description: 'Två bitar med flamberad lax, vars lätt brända yta tillför en extra dimension av smak och textur – en modern twist på traditionell nigiri.',
    price: 35,
    image: '/menu-images/1 par lax flamberad.jpg',
    category: 'nigiri-par',
    ingredients: ['Flamberad lax', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-flamberad-raka',
    name: 'Flamberad Räka',
    description: 'Två bitar med flamberad räka där den delikata, lätt rostade ytan lyfter den naturliga räksmaken till nya höjder – ett måste för den äventyrlige.',
    price: 35,
    image: '/menu-images/1 par raka flamberad.jpg',
    category: 'nigiri-par',
    ingredients: ['Flamberad räka', 'Sushi-ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // DRYCKER
  {
    id: 'coca-cola',
    name: 'Coca-Cola 33 cl',
    description: 'En klassisk, bubblande läskedryck med en tidlös smak som kompletterar måltiden perfekt.',
    price: 20,
    image: '/menu-images/coca-cola.jpg',
    category: 'drycker',
    ingredients: ['Coca-Cola'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'coca-cola-zero',
    name: 'Coca-Cola Zero 33 cl',
    description: 'Den sockerfria versionen av den ikoniska läsken, med samma uppfriskande smak och karaktär.',
    price: 20,
    image: '/menu-images/coca-cola-zero.jpg',
    category: 'drycker',
    ingredients: ['Coca-Cola Zero'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'fanta',
    name: 'Fanta 33 cl',
    description: 'En fruktig och bubblande dryck med en söt och livlig smak som passar till alla typer av måltider.',
    price: 20,
    image: '/menu-images/fanta.jpg',
    category: 'drycker',
    ingredients: ['Fanta'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'fanta-exotic',
    name: 'Fanta Exotic 33 cl',
    description: 'En exotisk variant med toner av tropiska frukter, som tar dig med på en smakresa med varje klunk.',
    price: 20,
    image: '/menu-images/fanta-exotic.jpg',
    category: 'drycker',
    ingredients: ['Fanta Exotic'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'pepsi-max',
    name: 'Pepsi max 33 cl',
    description: 'En sockerfri Pepsi med maximal smak, perfekt för den som vill ha allt utan socker.',
    price: 20,
    image: '/menu-images/pepsi-max.jpg',
    category: 'drycker',
    ingredients: ['Pepsi Max'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'sprite',
    name: 'Sprite 33 cl',
    description: 'En citron-lime läsk med en frisk och klar smak – lätt och uppfriskande vid varje tillfälle.',
    price: 20,
    image: '/menu-images/sprite.jpg',
    category: 'drycker',
    ingredients: ['Sprite'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'ramlosa',
    name: 'Ramlösa 33 cl',
    description: 'Naturligt kolsyrat vatten med en ren och uppfriskande smak, ett hälsosamt val för törstsläckning.',
    price: 20,
    image: '/menu-images/ramlosa.jpg',
    category: 'drycker',
    ingredients: ['Ramlösa'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'ramlosa-citrus',
    name: 'Ramlösa Citrus 33 cl',
    description: 'Kolsyrat vatten med en hint av citrus, vilket ger en fräsch twist på en klassisk dryck.',
    price: 20,
    image: '/menu-images/ramlosa-citrus.jpg',
    category: 'drycker',
    ingredients: ['Ramlösa Citrus'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'pacha',
    name: 'Pacha – Fruktiga Favoriter',
    description: 'En läskedryck med en mix av fruktiga smaker som Peach, Mojito, Strawberry, Lychee, Apple och Melon – en festlig och uppfriskande dryck som lyfter hela måltiden.',
    price: 25,
    image: '/menu-images/pacha.jpg',
    category: 'drycker',
    ingredients: ['Pacha Mix'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  }
];

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      items: menuItems,
      categories,
      selectedCategory: 'all',
      searchQuery: '',
      selectedLocation: 'all',
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      
      getFilteredItems: () => {
        const { items, selectedCategory, searchQuery, selectedLocation } = get();
        
        return items.filter(item => {
          const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
          const matchesSearch = searchQuery === '' || 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesLocation = selectedLocation === 'all' || 
            item.locationAvailable?.includes(selectedLocation);
          
          return matchesCategory && matchesSearch && matchesLocation;
        });
      },
      
      getItemsByCategory: (category) => {
        const { items } = get();
        return items.filter(item => item.category === category);
      },
      
      getPopularItems: () => {
        const { items } = get();
        return items.filter(item => item.isPopular);
      }
    }),
    {
      name: 'menu-store',
      version: 2
    }
  )
); 