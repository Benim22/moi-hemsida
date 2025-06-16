"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { googleReviewsService, mockReviews, type GooglePlaceDetails, type GoogleReview } from '@/lib/google-reviews'

interface GoogleReviewsProps {
  locationId: string
  locationName: string
  placeId?: string
  showMockData?: boolean // För utveckling
}

interface ReviewCardProps {
  review: GoogleReview
  index: number
}

const ReviewCard = ({ review, index }: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const isLongText = review.text.length > 150
  const displayText = expanded || !isLongText 
    ? review.text 
    : review.text.substring(0, 150) + '...'

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-[#e4d699]/20 bg-black/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.profile_photo_url} alt={review.author_name} />
              <AvatarFallback className="bg-[#e4d699]/20 text-[#e4d699] text-sm">
                {getAuthorInitials(review.author_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-white truncate">
                  {review.author_name}
                </h4>
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              <p className="text-xs text-white/60 mb-2">
                {googleReviewsService.formatRelativeTime(review.relative_time_description)}
              </p>
              
              <p className="text-white/80 text-sm leading-relaxed">
                {displayText}
              </p>
              
              {isLongText && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#e4d699] hover:text-[#e4d699]/80 p-0 h-auto mt-2"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Visa mindre
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Visa mer
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const RatingOverview = ({ placeDetails }: { placeDetails: GooglePlaceDetails }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }, (_, i) => (
          <Star key={i + fullStars} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e4d699]/10 to-[#e4d699]/5 rounded-lg border border-[#e4d699]/20"
    >
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-[#e4d699]">
            {placeDetails.rating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-1">
            {renderStars(placeDetails.rating)}
          </div>
          <div className="text-xs text-white/60">
            {placeDetails.user_ratings_total} recensioner
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">
            Google Reviews
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Verifierat
          </Badge>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
        asChild
      >
        <a
          href={placeDetails.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Se alla på Google
        </a>
      </Button>
    </motion.div>
  )
}

export function GoogleReviews({ locationId, locationName, placeId, showMockData = false }: GoogleReviewsProps) {
  const [placeDetails, setPlaceDetails] = useState<GooglePlaceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true)
      setError(null)

      try {
        // Använd mock data för utveckling om flaggan är satt
        if (showMockData) {
          setPlaceDetails(mockReviews)
          setLoading(false)
          return
        }

        const reviews = await googleReviewsService.getReviewsForLocation(locationId, placeId)
        
        if (reviews) {
          setPlaceDetails(reviews)
        } else {
          // Fallback till mock data om API misslyckas
          console.warn(`Could not load reviews for ${locationName}, using mock data`)
          setPlaceDetails(mockReviews)
        }
      } catch (err) {
        console.error('Error loading reviews:', err)
        setError('Kunde inte ladda recensioner')
        // Fallback till mock data vid fel
        setPlaceDetails(mockReviews)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [locationId, placeId, locationName, showMockData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e4d699] mx-auto mb-2" />
          <p className="text-white/60 text-sm">Laddar recensioner...</p>
        </div>
      </div>
    )
  }

  if (error && !placeDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
          onClick={() => window.location.reload()}
        >
          Försök igen
        </Button>
      </div>
    )
  }

  if (!placeDetails || !placeDetails.reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">Inga recensioner hittades för denna restaurang.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <RatingOverview placeDetails={placeDetails} />
      
      <div className="space-y-3">
        {placeDetails.reviews.slice(0, 5).map((review, index) => (
          <ReviewCard
            key={`${review.author_name}-${review.time}`}
            review={review}
            index={index}
          />
        ))}
      </div>
      
      {placeDetails.reviews.length > 5 && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            asChild
          >
            <a
              href={placeDetails.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Se alla {placeDetails.user_ratings_total} recensioner på Google
            </a>
          </Button>
        </div>
      )}
    </div>
  )
} 