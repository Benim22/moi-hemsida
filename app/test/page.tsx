"use client"

import { useSimpleAuth } from "@/context/simple-auth-context"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  const { user, profile, isAdmin, refreshSession } = useSimpleAuth()

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Test Sida</h1>
        
        <div className="bg-black/50 border border-[#e4d699]/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status:</h2>
          
          <div className="space-y-2">
            <p>User: {user ? "✅ Inloggad" : "❌ Inte inloggad"}</p>
            <p>Profile: {profile ? "✅ Profil hittad" : "❌ Ingen profil"}</p>
            <p>Admin: {isAdmin ? "✅ Admin" : "❌ Inte admin"}</p>
          </div>

          {user && (
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              {profile && (
                <>
                  <p><strong>Namn:</strong> {profile.name || "Inte angivet"}</p>
                  <p><strong>Roll:</strong> {profile.role}</p>
                </>
              )}
            </div>
          )}
          
          <div className="mt-6 space-y-4">
            <p className="text-green-400">✅ Applikationen fungerar! Auth context var problemet.</p>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => refreshSession()}
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                🔄 Uppdatera Session
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
              >
                🔄 Ladda om sida
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 