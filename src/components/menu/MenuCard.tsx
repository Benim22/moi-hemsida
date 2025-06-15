'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Plus, Flame, ShoppingCart, Star, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useFavoriteStore } from '@/stores/favorite-store';
import type { MenuItem } from '@/stores/menu-store';
import Image from 'next/image';

interface MenuCardProps {
  item: MenuItem;
  showAddToCart?: boolean;
  delay?: number;
}

export default function MenuCard({ 
  item, 
  showAddToCart = true, 
  delay = 0 
}: MenuCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const { addItem } = useCartStore();
  const { favorites, toggleFavorite } = useFavoriteStore();
  const isFavorite = favorites.includes(item.id);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  };

  const formatPrice = (price: number) => {
    return `${price} kr`;
  };

  const getSpicyLevelColor = (level: number) => {
    if (level === 0) return 'text-gray-400';
    if (level === 1) return 'text-yellow-500';
    if (level === 2) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-dark-card text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      {/* Bild sektion */}
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-food.svg';
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
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
              Veg
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
          className="absolute top-3 right-3 w-8 h-8 p-0 bg-black/50 hover:bg-black/70"
          onClick={() => toggleFavorite(item.id)}
        >
          <Heart 
            className={`w-4 h-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
            }`} 
          />
        </Button>

        {/* Pris */}
        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-bold text-gold">{item.price} kr</span>
        </div>
      </div>

      {/* Innehåll */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-white line-clamp-1">
          {item.name}
        </h3>
        
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Ingredienser */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-400 mb-1">Ingredienser:</p>
            <p className="text-xs text-gray-300 line-clamp-1">
              {item.ingredients.join(', ')}
            </p>
          </div>
        )}

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-400 mb-1">Allergener:</p>
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-xs">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Näringsinfo */}
        {item.nutritionalInfo && (
          <div className="mb-3 text-xs text-gray-400">
            <p>
              {item.nutritionalInfo.calories && `${item.nutritionalInfo.calories} kcal`}
              {item.nutritionalInfo.protein && ` • ${item.nutritionalInfo.protein}g protein`}
            </p>
          </div>
        )}

        {/* Köp knapp */}
        {showAddToCart && (
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Lägg till i varukorg
          </Button>
        )}
      </div>
    </motion.div>
  );
} 