"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Instagram, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LinkPreview } from "@/components/link-preview"
import { cn } from "@/lib/utils"

// Placeholder Instagram posts
// In a real implementation, these would come from the Instagram API
const PLACEHOLDER_POSTS = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000",
    caption: "Färsk sushi direkt från köket! #sushi #moisushi #trelleborg",
    likes: 42,
    timestamp: "2023-09-15T14:23:00Z",
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000",
    caption: "Vår populära Rainbow Roll - en explosion av färg och smak! #rainbowroll #sushi",
    likes: 56,
    timestamp: "2023-09-10T12:15:00Z",
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000",
    caption: "Pokébowl med färska ingredienser och hemlagad sås #pokebowl #healthy",
    likes: 38,
    timestamp: "2023-09-05T18:30:00Z",
  },
  {
    id: "4",
    imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=1000",
    caption: "Dagens leverans av färsk fisk! Kvalitet är allt för oss. #kvalitet #färskhet",
    likes: 29,
    timestamp: "2023-09-01T09:45:00Z",
  },
  {
    id: "5",
    imageUrl: "https://images.unsplash.com/photo-1583623025817-d180a2fe075e?q=80&w=1000",
    caption: "Vår kock i full koncentration. Konsten att skapa perfekt sushi! #sushiart #chef",
    likes: 63,
    timestamp: "2023-08-28T16:20:00Z",
  },
  {
    id: "6",
    imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1000",
    caption: "Sashimi av högsta kvalitet - smaka skillnaden! #sashimi #premium",
    likes: 47,
    timestamp: "2023-08-25T13:10:00Z",
  },
]

interface InstagramFeedProps {
  username: string
  limit?: number
  className?: string
}

export function InstagramFeed({ username, limit = 6, className }: InstagramFeedProps) {
  const [posts, setPosts] = useState(PLACEHOLDER_POSTS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In a real implementation, this would fetch data from the Instagram API
  useEffect(() => {
    // This is just a mock implementation
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setPosts(PLACEHOLDER_POSTS.slice(0, limit))
      setIsLoading(false)
    }, 1000)

    // Real implementation would be something like:
    // async function fetchInstagramPosts() {
    //   try {
    //     const response = await fetch(`/api/instagram?username=${username}&limit=${limit}`)
    //     const data = await response.json()
    //     if (data.error) {
    //       setError(data.error)
    //     } else {
    //       setPosts(data)
    //     }
    //   } catch (err) {
    //     setError('Failed to fetch Instagram posts')
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    //
    // fetchInstagramPosts()
  }, [username, limit])

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-white/70">Kunde inte ladda Instagram-inlägg: {error}</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-yellow-500 to-pink-600 p-2 rounded-full">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">@{username}</h3>
            <p className="text-white/70 text-sm">Följ oss på Instagram</p>
          </div>
        </div>
        <Button variant="outline" className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10" asChild>
          <a href={`https://www.instagram.com/${username}/`} target="_blank" rel="noopener noreferrer">
            Visa profil
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-black/30 rounded-lg animate-pulse border border-[#e4d699]/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={`https://instagram.com/p/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square relative group rounded-lg overflow-hidden border border-[#e4d699]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.caption.split("#")[0]}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-white text-xs line-clamp-2 mb-1">{post.caption.split("#")[0]}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#e4d699] text-xs">{post.likes} likes</span>
                  <span className="text-white/70 text-xs">{formatDate(post.timestamp)}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  )
}

