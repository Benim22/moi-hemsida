"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  role: string
  avatar_url?: string
  preferences?: {
    notifications: {
      orderUpdates: boolean
      promotions: boolean
      newsletter: boolean
    }
    privacy: {
      profileVisible: boolean
      shareData: boolean
    }
  }
}

type SimpleAuthContextType = {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: { name: string; phone?: string; address?: string }) => Promise<any>
  updatePreferences: (preferences: Profile['preferences']) => Promise<any>
  signInWithGoogle: () => Promise<any>
  createProfilesTable: () => Promise<any>
  isProfilesTableMissing: boolean
  refreshSession: () => Promise<void>
  loading: boolean
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    // Sätt mycket kortare timeout för att förhindra oändlig loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('SimpleAuthProvider: Loading timeout (5s), setting loading to false')
        setLoading(false)
      }
    }, 5000) // Bara 5 sekunder timeout!

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const getInitialSession = async () => {
    try {
      // Kontrollera omedelbart om Supabase är konfigurerat
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('SimpleAuthProvider: Supabase not configured')
        setLoading(false)
        return
      }

      // Använd Promise.race för snabbare timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      )

      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      if (error) {
        console.error("SimpleAuthProvider: Session error:", error)
        setLoading(false)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error("SimpleAuthProvider: Error getting initial session:", error)
      setLoading(false)
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      console.log("SimpleAuthProvider: Loading profile for user:", userId)
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("SimpleAuthProvider: Profile error:", error)
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log("SimpleAuthProvider: Profile not found, creating new profile")
          
          // Get user info from auth
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Check if this should be an admin user
            const adminEmails = ['lucas@skaply.se', 'lukage22@gmail.com']
            const isAdminEmail = adminEmails.includes(user.email || '')
            
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email,
                role: isAdminEmail ? "admin" : "customer",
                name: user.user_metadata?.name || null,
                phone: user.user_metadata?.phone || null
              })
              .select("*")
              .single()

            if (createError) {
              console.error("SimpleAuthProvider: Error creating profile:", createError)
              // Set default values if profile creation fails
              setProfile(null)
              setIsAdmin(false)
              return
            }

            console.log("SimpleAuthProvider: Created new profile:", newProfile)
            setProfile(newProfile)
            setIsAdmin(newProfile.role === "admin")
            return
          }
        }
        
        // For other errors, set default values
        setProfile(null)
        setIsAdmin(false)
        return
      }

      if (data) {
        console.log("SimpleAuthProvider: Profile loaded:", data)
        setProfile(data)
        setIsAdmin(data.role === "admin")
        console.log("SimpleAuthProvider: isAdmin set to:", data.role === "admin")
      }
    } catch (error) {
      console.error("SimpleAuthProvider: Error loading profile:", error)
      setProfile(null)
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("SimpleAuthProvider: Sign in error:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) return { error: signUpError }

      // Create profile after signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: "customer"
          }])

        if (profileError) {
          console.error("SimpleAuthProvider: Error creating profile:", profileError)
        }
      }

      return { error: null }
    } catch (error) {
      console.error("SimpleAuthProvider: Sign up error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
    } catch (error) {
      console.error("SimpleAuthProvider: Error signing out:", error)
    }
  }

  const updateProfile = async (updates: { name: string; phone?: string; address?: string }) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          name: updates.name,
          phone: updates.phone,
          address: updates.address
        })
      }

      return { error: null }
    } catch (error) {
      console.error("SimpleAuthProvider: Error updating profile:", error)
      return { error }
    }
  }

  const updatePreferences = async (preferences: Profile['preferences']) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          preferences: preferences
        })
      }

      return { error: null }
    } catch (error) {
      console.error("SimpleAuthProvider: Error updating preferences:", error)
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      console.error("SimpleAuthProvider: Google sign in error:", error)
      return { error }
    }
  }

  const createProfilesTable = async () => {
    return { error: null }
  }

  const refreshSession = async () => {
    if (!mounted) return
    
    try {
      // Kontrollera om Supabase är konfigurerat
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('SimpleAuthProvider: Supabase not configured for session refresh')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && session.user.id !== user?.id) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
    } catch (error) {
      console.error("SimpleAuthProvider: Error refreshing session:", error)
    }
  }

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePreferences,
        signInWithGoogle,
        createProfilesTable,
        isProfilesTableMissing: false,
        refreshSession,
        loading,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider")
  }
  return context
} 