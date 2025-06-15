// Utökad menydata - Resterande kategorier
export const extendedMenuItems = [
  // MOIS POKEBOWLS – Färgsprakande Pokébowls
  {
    id: 'spicy-beef-bowl',
    name: 'Spicy Beef',
    description: 'En pokébowl med marinerat yakiniku-kött som kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En kryddig och färgglad rätt som levererar en explosion av smak i varje tugga.',
    price: 135,
    image: '/menu-images/spicy beef.jpg',
    category: 'pokebowls',
    isSpicy: true,
    ingredients: ['Yakiniku-kött', 'Mango', 'Sjögräs', 'Gurka', 'Kimchi', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'crispy-chicken-bowl',
    name: 'Crispy Chicken',
    description: 'Friterad kyckling serverad med en rad fräscha ingredienser som mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En välbalanserad bowl där krispighet och fräschhet går hand i hand.',
    price: 135,
    image: '/menu-images/crispy chicken.png',
    category: 'pokebowls',
    ingredients: ['Friterad kyckling', 'Mango', 'Sjögräs', 'Gurka', 'Kimchi', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'crazy-swede',
    name: 'Crazy Swede',
    description: 'En oväntad mix av friterad kyckling och yakiniku-kött, som tillsammans blandas med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En rätt med djärva smaker och en härlig texturvariation.',
    price: 145,
    image: '/menu-images/crazy swede.jpg',
    category: 'pokebowls',
    ingredients: ['Friterad kyckling', 'Yakiniku-kött', 'Mango', 'Sjögräs', 'Kimchi'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'magic-lax-bowl',
    name: 'Magic Lax',
    description: 'Rå lax kombineras med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix i denna eleganta bowl. En fräsch och sofistikerad rätt som hyllar råvarornas naturliga smaker.',
    price: 149,
    image: '/menu-images/magic lax.jpg',
    category: 'pokebowls',
    isPopular: true,
    ingredients: ['Rå lax', 'Mango', 'Sjögräs', 'Gurka', 'Kimchi', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'lemon-shrimp-bowl',
    name: 'Lemon Shrimp',
    description: 'Friterade tempuraräkor serverade med en uppfriskande mix av mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. Den subtila citronnoten lyfter rätten till nya höjder.',
    price: 135,
    image: '/menu-images/lemon shrimp.jpg',
    category: 'pokebowls',
    ingredients: ['Tempuraräkor', 'Mango', 'Sjögräs', 'Gurka', 'Citron', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'vegan-bowl',
    name: 'Vegan Bowl',
    description: 'En helt växtbaserad bowl med tofu inari, kombinerat med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En näringsrik och färgstark rätt som bevisar att veganskt kan vara både mättande och inspirerande.',
    price: 129,
    image: '/menu-images/vegan bowl.jpg',
    category: 'pokebowls',
    isVegetarian: true,
    ingredients: ['Tofu inari', 'Mango', 'Sjögräs', 'Gurka', 'Kimchi', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'veggo-bowl',
    name: 'Veggo',
    description: 'Friterad halloumi blandas med mango, sjögräs, gurka, kimchi, inlagd rödlök, edamame och salladsmix. En oväntad twist för ostälskare som söker en balanserad och smakrik pokébowl.',
    price: 135,
    image: '/menu-images/veggo bowl.jpg',
    category: 'pokebowls',
    isVegetarian: true,
    ingredients: ['Friterad halloumi', 'Mango', 'Sjögräs', 'Gurka', 'Kimchi', 'Edamame'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'chicken-sallad',
    name: 'Chicken Sallad',
    description: 'Tärnad kyckling blandas med färska grönsaker i en lätt sallad som är både näringsrik och smakfull. En idealisk rätt för den som vill ha något fräscht och enkelt.',
    price: 119,
    image: '/menu-images/chicken sallad.jpg',
    category: 'pokebowls',
    ingredients: ['Tärnad kyckling', 'Sallad', 'Grönsaker'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'shrimp-bowl',
    name: 'Shrimp Bowl',
    description: 'Handskalade räkor serveras med en balanserad mix av grönsaker och andra noggrant utvalda ingredienser. En elegant bowl som tar dig direkt till autentisk japansk smak.',
    price: 145,
    image: '/menu-images/shrimp bowl.jpg',
    category: 'pokebowls',
    ingredients: ['Handskalade räkor', 'Grönsaker', 'Ris'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // NIGIRI COMBORÄTTER – Nigiri Fusion
  {
    id: 'nigiri-mix-8',
    name: 'Nigiri Mix 8 Bitar',
    description: '8 bitar med en kockutvald blandning av nigiri, där varje bit speglar en unik kombination av färska ingredienser. En perfekt introduktion till vår nigiri-fusion.',
    price: 109,
    image: '/menu-images/nigiri mix 8.jpg',
    category: 'nigiri-combo',
    isPopular: true,
    ingredients: ['Blandad nigiri', '8 bitar'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'nigiri-mix-14',
    name: 'Nigiri Mix 14 Bitar',
    description: 'En generös sats med 14 bitar där kockens kreativitet och passion går igenom i varje detalj. En rik variation som passar den som vill uppleva allt på en gång.',
    price: 169,
    image: '/menu-images/nigiri mix 14.jpg',
    category: 'nigiri-combo',
    ingredients: ['Blandad nigiri', '14 bitar'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'omakase-sushi',
    name: 'Omakase Sushi – Munchies 8 Bitar',
    description: 'En spännande mix av 4 maki och 4 nigiri, designad för att ta dig med på en smakresa där kockens rekommendationer lyser starkt. En perfekt balans mellan tradition och innovation.',
    price: 89,
    image: '/menu-images/omakase.jpg',
    category: 'nigiri-combo',
    ingredients: ['4 maki', '4 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'single-12',
    name: 'Single 12 Bitar',
    description: 'Med 8 maki och 4 nigiri erbjuder denna sats en välavvägd kombination för den som önskar en mindre portion men med full smak. Varje bit är noggrant tillagad för optimal njutning.',
    price: 139,
    image: '/menu-images/single 12.jpg',
    category: 'nigiri-combo',
    ingredients: ['8 maki', '4 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'hungry-16',
    name: 'Hungry 16 Bitar',
    description: '8 maki och 8 nigiri i en sats som är gjord för den stora sushilusten. En mångsidig blandning som ger dig möjlighet att njuta av en rad olika smaker i varje tugga.',
    price: 199,
    image: '/menu-images/hungry 16.jpg',
    category: 'nigiri-combo',
    ingredients: ['8 maki', '8 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'duo-20',
    name: 'Duo 20 Bitar',
    description: '12 maki och 8 nigiri – perfekt för att dela med en vän. Denna sats kombinerar traditionella inslag med en modern twist, vilket skapar en oförglömlig upplevelse.',
    price: 249,
    image: '/menu-images/duo 20.jpg',
    category: 'nigiri-combo',
    ingredients: ['12 maki', '8 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'company-30',
    name: 'Company 30 Bitar',
    description: '16 maki och 14 nigiri – en omfattande sats som passar perfekt för företagsevenemang eller större sällskap. Här får du en bred palett av smaker att njuta av tillsammans.',
    price: 349,
    image: '/menu-images/company 30.jpg',
    category: 'nigiri-combo',
    ingredients: ['16 maki', '14 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'gathering-40',
    name: 'Gathering 40 Bitar',
    description: '24 maki och 16 nigiri, designade för att delas med vänner och familj. En generös blandning som inbjuder till gemenskap och festlig stämning.',
    price: 449,
    image: '/menu-images/gathering 40.jpg',
    category: 'nigiri-combo',
    ingredients: ['24 maki', '16 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'family-50',
    name: 'Family 50 Bitar',
    description: '32 maki och 18 nigiri – en riktig familjefest med en balanserad mix av klassiska och kreativa sushibitar. Perfekt för att njuta tillsammans i goda vänners lag.',
    price: 549,
    image: '/menu-images/family 50.jpg',
    category: 'nigiri-combo',
    ingredients: ['32 maki', '18 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'party-100',
    name: 'Party 100 Bitar',
    description: 'En imponerande sats med 64 maki och 36 nigiri, skapad för de stora festligheterna. Här möts tradition, innovation och generositet i varje bit.',
    price: 999,
    image: '/menu-images/party 100.jpg',
    category: 'nigiri-combo',
    isPopular: true,
    ingredients: ['64 maki', '36 nigiri'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // EXOTISKA DELIKATESSER
  {
    id: 'sashimi-lax-10',
    name: 'Sashimi Lax 10 Bitar',
    description: 'Tunna, färska bitar av lax som framhäver fiskens rena och delikata smak. En elegant rätt som är lika visuellt tilltalande som den är smakfull.',
    price: 139,
    image: '/menu-images/sashimi lax.jpg',
    category: 'exotiska',
    isPopular: true,
    ingredients: ['Färsk lax', '10 bitar'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'yakiniku',
    name: 'Yakiniku',
    description: 'Skivad och marinerad biff serverad med ris, salladsmix, chilimajonnäs och teriyaki. En rätt som förenar det bästa från japansk och västerländsk matlagning för en rik och intensiv smakupplevelse.',
    price: 139,
    image: '/menu-images/yakiniku.jpg',
    category: 'exotiska',
    ingredients: ['Marinerad biff', 'Ris', 'Chilimajonnäs', 'Teriyaki'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'ebifry',
    name: 'EbiFry',
    description: 'Tempura-friterade räkor med ris, teriyakisås, chilimajonnäs, inlagd rödlök, gurka och salladsmix. En harmonisk rätt där krispighet möter en fyllig såsig rikedom.',
    price: 139,
    image: '/menu-images/ebifry.jpg',
    category: 'exotiska',
    ingredients: ['Tempura räkor', 'Ris', 'Teriyaki', 'Chilimajonnäs'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },

  // BARNMENYER
  {
    id: 'risbollar-8',
    name: '8 Bitar Risbollar – Helt Naturella',
    description: 'Små, naturella risbollar som är anpassade för de små. En enkel och smakfull rätt som ger energi och glädje.',
    price: 39,
    image: '/menu-images/8 risbollar natruella .jpg',
    category: 'barnmeny',
    isVegetarian: true,
    ingredients: ['Naturella risbollar', '8 bitar'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  },
  {
    id: 'ris-kyckling-barn',
    name: 'Ris, Kyckling, Gurka & Mango',
    description: 'En balanserad rätt med mjuka risbitar, tärnad kyckling, färsk gurka och söt mango. Speciellt framtagen för att passa barns smaklökar med en lätt och näringsrik komposition.',
    price: 75,
    image: '/menu-images/ris kyckling barn.jpg',
    category: 'barnmeny',
    ingredients: ['Ris', 'Kyckling', 'Gurka', 'Mango'],
    locationAvailable: ['malmo', 'trelleborg', 'ystad']
  }
]; 