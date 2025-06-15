"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// import { useAuth } from "@/context/auth-context"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, Settings, ShoppingBag, LogOut, UserPlus } from "lucide-react"

export function UserMenu() {
  const { user, profile, signOut, isAdmin, refreshSession, loading } = useAuth()
  const router = useRouter()

  // Check if Supabase environment variables are set
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    // Refresh the session when the component mounts (only once)
    refreshSession()
  }, []) // Removed refreshSession from dependencies to prevent loop

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // If Supabase is not configured, show a disabled button
  if (!isSupabaseConfigured) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-[#e4d699]/30 text-[#e4d699]/50 cursor-not-allowed opacity-70"
        disabled
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Logga in
      </Button>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-[#e4d699]/30 text-[#e4d699] cursor-not-allowed opacity-70"
        disabled
      >
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Laddar...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
        onClick={() => router.push("/auth/login")}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Logga in
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "User"} />
            <AvatarFallback className="bg-[#e4d699]/20 text-[#e4d699]">{getInitials(profile?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.name || "Användare"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Min profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Mina beställningar</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Inställningar</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logga ut</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

