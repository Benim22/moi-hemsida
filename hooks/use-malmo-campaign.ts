import { useState, useEffect } from 'react'

export function useMalmoCampaign() {
  // const [showSticky, setShowSticky] = useState(false)
  const [hasSeenCampaign, setHasSeenCampaign] = useState(false)

  useEffect(() => {
    // Check if user has already seen the campaign
    const seen = localStorage.getItem('malmo-campaign-seen')
    if (seen) {
      setHasSeenCampaign(true)
    }

    // Ta bort scroll-hantering för sticky banner
    // const handleScroll = () => {
    //   const scrolled = window.scrollY > 500
    //   setShowSticky(scrolled && !hasSeenCampaign)
    // }

    // window.addEventListener('scroll', handleScroll)
    // return () => window.removeEventListener('scroll', handleScroll)
  }, [hasSeenCampaign])

  const markCampaignAsSeen = () => {
    localStorage.setItem('malmo-campaign-seen', 'true')
    setHasSeenCampaign(true)
    // setShowSticky(false)
  }

  const resetCampaign = () => {
    localStorage.removeItem('malmo-campaign-seen')
    setHasSeenCampaign(false)
  }

  return {
    // showSticky,
    hasSeenCampaign,
    markCampaignAsSeen,
    resetCampaign
  }
} 