-- Add location column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing users to have a default location if needed
-- UPDATE profiles SET location = 'trelleborg' WHERE location IS NULL; 