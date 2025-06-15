-- User preferences schema
-- Adds notification and privacy preferences to the profiles table

-- Add new columns to the profiles table for user preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  preferences JSONB DEFAULT '{
    "notifications": {
      "orderUpdates": true,
      "promotions": false,
      "newsletter": false
    },
    "privacy": {
      "profileVisible": true,
      "shareData": false
    }
  }'::jsonb;

-- Create an index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON public.profiles USING GIN (preferences);

-- Create a function to update user preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences(
  user_id UUID,
  new_preferences JSONB
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the preferences column with the new preferences
  UPDATE public.profiles 
  SET 
    preferences = new_preferences,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Return the updated profile
  RETURN QUERY SELECT * FROM public.profiles WHERE id = user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_user_preferences(UUID, JSONB) TO authenticated;

-- Update existing profiles to have default preferences if they don't have any
UPDATE public.profiles 
SET preferences = '{
  "notifications": {
    "orderUpdates": true,
    "promotions": false,
    "newsletter": false
  },
  "privacy": {
    "profileVisible": true,
    "shareData": false
  }
}'::jsonb
WHERE preferences IS NULL;

-- Create a function to get user preferences
CREATE OR REPLACE FUNCTION public.get_user_preferences(user_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT preferences FROM public.profiles WHERE id = user_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_preferences(UUID) TO authenticated; 