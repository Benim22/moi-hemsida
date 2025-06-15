'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  Star,
  Leaf,
  Flame,
  MapPin,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMenuStore } from '@/stores/menu-store';
import { useCartStore } from '@/stores/cart-store';
import { useFavoriteStore } from '@/stores/favorite-store';

const locationNames = {
  all: 'Alla platser',
  malmo: 'Malmö',
  trelleborg: 'Trelleborg',
  ystad: 'Ystad'
};

export default function MenuPage() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location') as 'malmo' | 'trelleborg' | 'ystad' | null;
  
  const {
    categories,
    selectedCategory,
    searchQuery,
    selectedLocation,
    setSelectedCategory,
    setSearchQuery,
    setSelectedLocation,
    getFilteredItems
  } = useMenuStore();
  
  const { addItem } = useCartStore();
  const { favorites, toggleFavorite } = useFavoriteStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const filteredItems = getFilteredItems();

  // Sätt initial plats från URL
  useEffect(() => {
    if (initialLocation && initialLocation !== selectedLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation, selectedLocation, setSelectedLocation]);

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Grid: '🍱',
      Sushi: '🍣',
      Flame: '🔥',
      Bowl: '🥗',
      Fish: '🐟',
      Knife: '🔪',
      Plus: '➕',
      Soup: '🍲',
      ChefHat: '👨‍🍳',
      Coffee: '☕'
    };
    return icons[iconName] || '🍱';
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-gold/20 to-gold/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Vår <span className="text-gold">Meny</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upptäck våra autentiska japanska rätter gjorda med de färskaste ingredienserna
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sök och Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Sök */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Sök efter rätter..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Platsfilter */}
            <div className="flex space-x-2">
              {Object.entries(locationNames).map(([key, name]) => (
                <Button
                  key={key}
                  variant={selectedLocation === key ? "default" : "outline"}
                  onClick={() => setSelectedLocation(key as any)}
                  className={selectedLocation === key ? "bg-gold text-black" : ""}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {name}
                </Button>
              ))}
            </div>

            {/* Filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Kategorier */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2 ${
            showFilters ? 'block' : 'hidden lg:grid'
          }`}>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-3 h-auto ${
                  selectedCategory === category.id 
                    ? "bg-gold text-black" 
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-2xl mb-1">{getCategoryIcon(category.icon)}</span>
                <span className="text-xs text-center leading-tight">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Resultat */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredItems.length} rätter 
            {selectedLocation !== 'all' && ` i ${locationNames[selectedLocation]}`}
            {searchQuery && ` som matchar "${searchQuery}"`}
          </p>
        </div>

        {/* Menyobjekt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Bild */}
              <div className="relative aspect-video bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                                     onError={(e) => {
                     // Fallback till placeholder om bilden inte finns
                     (e.target as HTMLImageElement).src = '/placeholder-food.svg';
                   }}
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {item.isPopular && (
                    <Badge className="bg-gold text-black">
                      <Star className="w-3 h-3 mr-1" />
                      Populär
                    </Badge>
                  )}
                  {item.isVegetarian && (
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      <Leaf className="w-3 h-3 mr-1" />
                      Vegetarisk
                    </Badge>
                  )}
                  {item.isSpicy && (
                    <Badge variant="destructive">
                      <Flame className="w-3 h-3 mr-1" />
                      Kryddig
                    </Badge>
                  )}
                </div>

                {/* Favoritknapp */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(item.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </Button>
              </div>

              {/* Innehåll */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                {/* Ingredienser */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ingredienser:</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.ingredients.join(', ')}
                    </p>
                  </div>
                )}

                {/* Platser */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {item.locationAvailable?.map((location) => (
                      <Badge key={location} variant="outline" className="text-xs">
                        {locationNames[location]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pris och köp */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold">{item.price} kr</span>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="bg-gold hover:bg-gold-dark text-black"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Lägg till
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inga resultat */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inga rätter hittades</h3>
            <p className="text-muted-foreground">
              Prova att ändra dina filterinställningar eller sökord
            </p>
            <Button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSelectedLocation('all');
              }}
              variant="outline"
              className="mt-4"
            >
              Rensa alla filter
            </Button>
          </div>
        )}

        {/* CTA sektion */}
        <section className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg p-8 mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Kan inte hitta det du söker?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Kontakta oss så hjälper vi dig att hitta den perfekta rätten eller skapa något speciellt för dig.
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black">
            <a href="tel:040-123-45-67">Ring oss: 040-123 45 67</a>
          </Button>
        </section>
      </div>
    </div>
  );
} 