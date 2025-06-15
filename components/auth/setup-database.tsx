"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { Loader2 } from "lucide-react"

export function SetupDatabase() {
  const { createProfilesTable } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await createProfilesTable()

      if (error) {
        setError(`Failed to set up database: ${error.message}`)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup Required</CardTitle>
        <CardDescription>
          The profiles table is missing in your Supabase database. This is required for the authentication system to
          work properly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            Database setup completed successfully! You can now use the authentication system.
          </div>
        )}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Click the button below to automatically set up the required database tables and functions to fix the
            infinite recursion error.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSetup} disabled={isLoading || success} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up database...
            </>
          ) : (
            "Setup Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

