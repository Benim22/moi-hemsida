'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Flame, Leaf } from 'lucide-react';
import { useMenuStore } from '@/stores/menu-store-supabase';
import { useCartStore } from '@/stores/cart-store-supabase';
import { useFavoriteStore } from '@/stores/favorite-store-supabase';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MenuGridProps {
  category?: string;
  location?: 'malmo' | 'trelleborg' | 'ystad' | 'all';
  searchTerm?: string;
}

export function MenuGrid({ category, location = 'all', searchTerm }: MenuGridProps) {
  const { items, loading, error, fetchItems, trackItemView, trackAddToCart } = useMenuStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems({
      category: category === 'all' ? undefined : category,
      location,
      search: searchTerm
    });
  }, [category, location, searchTerm, fetchItems]);

  const handleAddToCart = async (item: any) => {
    try {
      addToCart(item);
      await trackAddToCart(item.id);
      toast({
        title: 'Tillagd i varukorgen',
        description: `${item.name} har lagts till i din varukorg`,
      });
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte lägga till i varukorgen',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async (itemId: string) => {
    try {
      await toggleFavorite(itemId);
      toast({
        title: isFavorite(itemId) ? 'Borttagen från favoriter' : 'Tillagd i favoriter',
        description: 'Dina favoriter har uppdaterats',
      });
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte uppdatera favoriter',
        variant: 'destructive',
      });
    }
  };

  const handleItemClick = async (itemId: string) => {
    try {
      await trackItemView(itemId);
    } catch (error) {
      console.error('Failed to track item view:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-300 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Ett fel uppstod: {error}</p>
        <Button onClick={() => fetchItems()}>Försök igen</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Inga rätter hittades</p>
        {searchTerm && (
          <p className="text-sm text-gray-400">
            Prova att söka efter något annat eller ändra filtren
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="group hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleItemClick(item.id)}
        >
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
              src={item.image || '/placeholder-food.svg'}
              alt={item.name}
              width={400}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-food.svg';
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {item.popular && (
                <Badge variant="secondary" className="bg-orange-500 text-white">
                  Populär
                </Badge>
              )}
              {item.spicyLevel && item.spicyLevel > 0 && (
                <Badge variant="secondary" className="bg-red-500 text-white">
                  <Flame className="w-3 h-3 mr-1" />
                  {item.spicyLevel}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-2 left-2 p-2",
                isFavorite(item.id) ? "text-red-500" : "text-gray-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(item.id);
              }}
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  isFavorite(item.id) && "fill-current"
                )}
              />
            </Button>
          </div>
          
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap gap-1 mb-3">
              {item.ingredients?.slice(0, 3).map((ingredient) => (
                <Badge key={ingredient} variant="outline" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {item.ingredients && item.ingredients.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.ingredients.length - 3} till
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-green-600">
                {item.price} kr
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Lägg till
              </Button>
            </div>
            
            {item.nutritionalInfo && (
              <div className="mt-3 text-xs text-gray-500 flex gap-4">
                <span>{item.nutritionalInfo.calories} kcal</span>
                <span>{item.nutritionalInfo.protein}g protein</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 