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
  location?: string
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
  updateLocation: (location: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  createProfilesTable: () => Promise<any>
  isProfilesTableMissing: boolean
  refreshSession: () => Promise<void>
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isProfilesTableMissing, setIsProfilesTableMissing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Lista över admin emails - DIREKT admin-rättigheter
  const ADMIN_EMAILS = ['lucas@skaply.se', 'lukage22@gmail.com']

  // Forced admin check - om email är admin, sätt isAdmin = true omedelbart
  const checkAdminStatus = (email: string, profileRole?: string) => {
    const isAdminEmail = ADMIN_EMAILS.includes(email)
    const isAdminFromProfile = profileRole === 'admin'
    
    console.log(`🔍 Admin Check for ${email}:`)
    console.log(`  - Is Admin Email: ${isAdminEmail}`)
    console.log(`  - Profile Role: ${profileRole}`)
    console.log(`  - Is Admin From Profile: ${isAdminFromProfile}`)
    
    const finalAdminStatus = isAdminEmail || isAdminFromProfile
    console.log(`  - FINAL ADMIN STATUS: ${finalAdminStatus}`)
    
    setIsAdmin(finalAdminStatus)
    return finalAdminStatus
  }

  useEffect(() => {
    let mounted = true

    // Kraftig timeout - 3 sekunder max
    const timeout = setTimeout(() => {
      console.warn('⚠️  Loading timeout - setting loading to false')
      if (mounted) {
        setLoading(false)
      }
    }, 3000)

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("🔄 Auth state changed:", event)
      
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      if (session?.user) {
        console.log("✅ User session found:", session.user.email)
        setUser(session.user)
        
        // OMEDELBAR admin-check för kända emails
        checkAdminStatus(session.user.email || '')
        
        // Ladda profil i bakgrunden (men blocka inte admin-status)
        loadProfile(session.user.id, session.user.email || '')
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const getInitialSession = async () => {
    try {
      console.log("🚀 Getting initial session...")
      
      // Snabb session-check
      const { data: { session } } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]) as any
      
      if (session?.user) {
        console.log("✅ Initial session found:", session.user.email)
        setUser(session.user)
        
        // OMEDELBAR admin-check
        checkAdminStatus(session.user.email || '')
        
        // Ladda profil
        loadProfile(session.user.id, session.user.email || '')
      } else {
        console.log("❌ No initial session")
        setLoading(false)
      }
    } catch (error) {
      console.error("❌ Session error:", error)
      setLoading(false)
    }
  }

  const loadProfile = async (userId: string, userEmail: string) => {
    try {
      console.log("📝 Loading profile for:", userEmail)
      
      const { data, error } = await Promise.race([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 3000))
      ]) as any

      if (error) {
        console.error("❌ Profile error:", error)
        
        // För admin emails - behåll admin-status även om profil saknas
        if (ADMIN_EMAILS.includes(userEmail)) {
          console.log("🔥 ADMIN EMAIL - Keeping admin status despite profile error")
          setIsAdmin(true)
        }
      } else if (data) {
        console.log("✅ Profile loaded:", data)
        setProfile(data)
        
        // Dubbelkolla admin-status med profil-data
        checkAdminStatus(userEmail, data.role)
      }
    } catch (error) {
      console.error("❌ Profile load exception:", error)
      
      // För admin emails - behåll admin-status
      if (ADMIN_EMAILS.includes(userEmail)) {
        console.log("🔥 ADMIN EMAIL - Setting admin=true despite error")
        setIsAdmin(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("🔐 Signing in:", email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!error) {
        // Omedelbar admin-check vid inloggning
        checkAdminStatus(email)
      }
      
      return { error }
    } catch (error) {
      console.error("❌ Sign in error:", error)
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

      if (data.user) {
        const isAdminEmail = ADMIN_EMAILS.includes(email)
        
        try {
          await supabase.from("profiles").insert([{
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: isAdminEmail ? "admin" : "customer"
          }])

          // Skicka välkomstmail
          try {
            await fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: name,
                customerEmail: email
              })
            })
          } catch (emailError) {
            console.error("Welcome email error:", emailError)
            // Fortsätt även om e-post misslyckas
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError)
        }
        
        if (isAdminEmail) {
          setIsAdmin(true)
        }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
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
      console.error("Sign out error:", error)
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
      console.error("Update profile error:", error)
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

      if (profile) {
        setProfile({
          ...profile,
          preferences: preferences
        })
      }

      return { error: null }
    } catch (error) {
      console.error("Update preferences error:", error)
      return { error }
    }
  }

  const updateLocation = async (location: string) => {
    if (!user) return { error: "No user logged in" }

    try {
      console.log("🏢 Updating user location to:", location)
      
      const { error } = await supabase
        .from("profiles")
        .update({
          location: location,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) throw error

      if (profile) {
        setProfile({
          ...profile,
          location: location
        })
      }

      console.log("✅ Location updated successfully")
      return { error: null }
    } catch (error) {
      console.error("❌ Update location error:", error)
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
      console.error("Google sign in error:", error)
      return { error }
    }
  }

  const createProfilesTable = async () => {
    return { error: null }
  }

  const refreshSession = async () => {
    try {
      console.log("🔄 Refreshing session...")
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        checkAdminStatus(session.user.email || '')
        loadProfile(session.user.id, session.user.email || '')
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    } catch (error) {
      console.error("Refresh session error:", error)
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePreferences,
    updateLocation,
    signInWithGoogle,
    createProfilesTable,
    isProfilesTableMissing,
    refreshSession,
    loading,
    setUser,
    setProfile
  }

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider")
  }
  return context
} 