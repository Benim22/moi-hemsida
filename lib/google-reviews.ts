// Google Reviews Service
// Denna service hanterar API-anrop för att hämta Google Reviews

export interface GoogleReview {
  author_name: string
  author_url?: string
  language: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

export interface GooglePlaceDetails {
  place_id: string
  name: string
  rating: number
  user_ratings_total: number
  reviews: GoogleReview[]
  url: string
}

class GoogleReviewsService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/place'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key saknas. Lägg till NEXT_PUBLIC_GOOGLE_PLACES_API_KEY i .env.local')
    }
  }

  /**
   * Hämta place_id för en restaurang baserat på namn och adress
   */
  async findPlaceId(name: string, address: string): Promise<string | null> {
    if (!this.apiKey) return null

    try {
      const query = encodeURIComponent(`${name} ${address}`)
      const response = await fetch(
        `${this.baseUrl}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${this.apiKey}`
      )

      const data = await response.json()
      
      if (data.status === 'OK' && data.candidates.length > 0) {
        return data.candidates[0].place_id
      }
      
      return null
    } catch (error) {
      console.error('Error finding place ID:', error)
      return null
    }
  }

  /**
   * Hämta detaljer och reviews för en plats
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    if (!this.apiKey || !placeId) return null

    try {
      const response = await fetch(
        `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&key=${this.apiKey}`
      )

      const data = await response.json()
      
      if (data.status === 'OK' && data.result) {
        return {
          place_id: placeId,
          name: data.result.name,
          rating: data.result.rating || 0,
          user_ratings_total: data.result.user_ratings_total || 0,
          reviews: data.result.reviews || [],
          url: data.result.url || ''
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  /**
   * Hämta reviews för en restaurang (med caching)
   */
  async getReviewsForLocation(locationId: string, placeId?: string): Promise<GooglePlaceDetails | null> {
    // Kontrollera cache först
    const cacheKey = `google-reviews-${locationId}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 timme cache
      return cached.data
    }

    if (!placeId) {
      console.warn(`No place_id provided for location ${locationId}`)
      return null
    }

    const reviews = await this.getPlaceDetails(placeId)
    
    if (reviews) {
      this.saveToCache(cacheKey, reviews)
    }
    
    return reviews
  }

  /**
   * Formatera relativ tid till svenska
   */
  formatRelativeTime(relativeTime: string): string {
    const translations: { [key: string]: string } = {
      'a day ago': 'för en dag sedan',
      'days ago': 'dagar sedan',
      'a week ago': 'för en vecka sedan',
      'weeks ago': 'veckor sedan',
      'a month ago': 'för en månad sedan',
      'months ago': 'månader sedan',
      'a year ago': 'för ett år sedan',
      'years ago': 'år sedan',
      'an hour ago': 'för en timme sedan',
      'hours ago': 'timmar sedan',
      'a minute ago': 'för en minut sedan',
      'minutes ago': 'minuter sedan'
    }

    let translatedTime = relativeTime
    Object.entries(translations).forEach(([english, swedish]) => {
      translatedTime = translatedTime.replace(english, swedish)
    })

    return translatedTime
  }

  /**
   * Enkel cache-implementering
   */
  private getFromCache(key: string): { data: any; timestamp: number } | null {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(key)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  private saveToCache(key: string, data: any): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch {
      // Ignorera cache-fel
    }
  }
}

export const googleReviewsService = new GoogleReviewsService()

// Fallback mock data för utveckling
export const mockReviews: GooglePlaceDetails = {
  place_id: 'mock-place-id',
  name: 'Moi Sushi',
  rating: 4.5,
  user_ratings_total: 127,
  url: 'https://www.google.com/maps/place/Moi+Sushi',
  reviews: [
    {
      author_name: 'Anna Andersson',
      rating: 5,
      text: 'Fantastisk sushi! Alltid färska ingredienser och vänlig personal. Kommer definitivt tillbaka.',
      relative_time_description: 'för 2 veckor sedan',
      language: 'sv',
      time: Date.now() - 14 * 24 * 60 * 60 * 1000
    },
    {
      author_name: 'Erik Johansson',
      rating: 4,
      text: 'Mycket bra mat och service. Poké bowls var särskilt goda. Kan rekommendera!',
      relative_time_description: 'för 1 månad sedan',
      language: 'sv',
      time: Date.now() - 30 * 24 * 60 * 60 * 1000
    },
    {
      author_name: 'Maria Petersson',
      rating: 5,
      text: 'Bästa sushi i Trelleborg! Perfekt för både avhämtning och dine-in.',
      relative_time_description: 'för 3 veckor sedan',
      language: 'sv',
      time: Date.now() - 21 * 24 * 60 * 60 * 1000
    }
  ]
} 