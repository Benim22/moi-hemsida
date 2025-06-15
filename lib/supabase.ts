import { createClient } from "@supabase/supabase-js"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a dummy client for SSR if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Authentication features will not work properly.")
}

// Initialize the Supabase client with more explicit options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser, // Only persist the session in browser environments
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
    flowType: "pkce", // Use PKCE flow for better security
    storage: isBrowser ? window.localStorage : undefined,
  },
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Helper function to execute SQL directly (for setup)
export const executeSQL = async (sql: string) => {
  try {
    // Direct query using the REST API
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error executing SQL:", error)
      return { error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error executing SQL:", error)
    return { error }
  }
}

// Create the necessary database structure for profile management
export const setupDatabase = async () => {
  // SQL to create the profiles table with proper RLS policies
  const sql = `
    -- Create the profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      address TEXT,
      avatar_url TEXT,
      role TEXT CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop all existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admin access policy" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    
    -- Create a policy for users to view their own profile
    CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
    
    -- Create a policy for users to update their own profile
    CREATE POLICY "Users can update own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
    
    -- Create a policy for users to insert their own profile
    CREATE POLICY "Users can insert own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
    
    -- Create a function to check if a user is an admin
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      );
    $$;
    
    -- Create an admin policy using the is_admin function
    CREATE POLICY "Admin access policy" 
    ON public.profiles 
    FOR ALL 
    USING (is_admin());
    
    -- Create a function to get a profile safely (bypassing RLS)
    CREATE OR REPLACE FUNCTION public.get_profile(user_id UUID)
    RETURNS SETOF profiles
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM profiles WHERE id = user_id;
    $$;
    
    -- Create a function to create or update a profile safely (bypassing RLS)
    CREATE OR REPLACE FUNCTION public.create_or_update_profile(
      user_id UUID,
      user_email TEXT,
      user_name TEXT DEFAULT NULL
    )
    RETURNS SETOF profiles
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      INSERT INTO profiles (id, email, name, role, created_at, updated_at)
      VALUES (
        user_id, 
        user_email, 
        COALESCE(user_name, ''), 
        'customer',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        updated_at = NOW()
      RETURNING *;
    END;
    $$;

    -- Function to handle auth user creation
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', ''),
        'customer',
        now(),
        now()
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for new user creation
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `

  return await executeSQL(sql)
}

