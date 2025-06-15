"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, setupDatabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  name?: string
  phone?: string
  avatar_url?: string
  role: string
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: { name: string; phone?: string }) => Promise<any>
  signInWithGoogle: () => Promise<any>
  createProfilesTable: () => Promise<any>
  isProfilesTableMissing: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isProfilesTableMissing, setIsProfilesTableMissing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Simplified profile fetch
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Exception in fetchProfile:", error)
      return null
    }
  }

  // Simplified session refresh
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error:", error)
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        return
      }

      if (session?.user) {
        setUser(session.user)
        
        // Try to get profile
        const profileData = await fetchProfile(session.user.id)
        if (profileData) {
          setProfile(profileData)
          setIsAdmin(profileData.role === "admin")
          setIsProfilesTableMissing(false)
        } else {
          setIsProfilesTableMissing(true)
        }
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Simple useEffect without complex dependencies
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      if (mounted) {
        await refreshSession()
      }
    }

    initAuth()

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        return
      }

      if (session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        if (profileData) {
          setProfile(profileData)
          setIsAdmin(profileData.role === "admin")
        }
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        // Don't fetch profile here - let the auth state change handler do it
        return { error: null }
      }

      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      return { error, data }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }

      // Clear user state regardless of whether there was an error
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      router.push("/auth/login")
    } catch (error) {
      console.error("Exception in signOut:", error)
      // Still clear user state on exception
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      router.push("/auth/login")
    }
  }

  const updateProfile = async (updates: { name: string; phone?: string }) => {
    if (!user) return { error: "No user logged in" }

    try {
      // Update the profile in the database
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        return { error }
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, ...updates })
      }

      return { error: null }
    } catch (error) {
      console.error("Exception in updateProfile:", error)
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error signing in with Google:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Exception in signInWithGoogle:", error)
      return { error }
    }
  }

  const createProfilesTable = async () => {
    // Simplified implementation
    setIsProfilesTableMissing(false)
    return { error: null }
  }

  const value = {
    user,
    profile,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    signInWithGoogle,
    createProfilesTable,
    isProfilesTableMissing,
    refreshSession,
  }

  // Don't render children until we've checked for a session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699]"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

