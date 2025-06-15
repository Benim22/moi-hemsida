-- Locations table for storing restaurant location information
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  services JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  opening_hours JSONB DEFAULT '{}'::jsonb,
  menu_type TEXT DEFAULT 'full' CHECK (menu_type IN ('full', 'pokebowl')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default locations
INSERT INTO locations (
  id, name, display_name, address, phone, email, description, image_url,
  latitude, longitude, services, features, opening_hours, menu_type
) VALUES 
(
  'trelleborg',
  'Trelleborg',
  'Moi Sushi Trelleborg',
  'Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg',
  '0410-28110',
  'trelleborg@moisushi.se',
  'Vår första restaurang i hjärtat av Trelleborg. Här serverar vi traditionell sushi och moderna poké bowls i en mysig atmosfär.',
  'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
  55.3758,
  13.1568,
  '["delivery", "pickup", "dine-in"]'::jsonb,
  '["Traditionell sushi", "Poké bowls", "Vegetariska alternativ", "Glutenfria alternativ"]'::jsonb,
  '{
    "måndag": "11:00 - 21:00",
    "tisdag": "11:00 - 21:00",
    "onsdag": "11:00 - 21:00",
    "torsdag": "11:00 - 21:00",
    "fredag": "11:00 - 21:00",
    "lördag": "12:00 - 21:00",
    "söndag": "15:00 - 21:00"
  }'::jsonb,
  'full'
),
(
  'ystad',
  'Ystad',
  'Moi Sushi Food Truck Ystad',
  'Stortorget, 271 30, Ystad',
  '0411-55120',
  'ystad@moisushi.se',
  'Vår mobila food truck som serverar färska poké bowls på Ystads vackra Stortorg. Perfekt för en snabb och hälsosam lunch.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2081&q=80',
  55.4295,
  13.8207,
  '["pickup"]'::jsonb,
  '["Poké bowls", "Färska ingredienser", "Snabb service", "Miljövänliga förpackningar"]'::jsonb,
  '{
    "måndag": "Stängt",
    "tisdag": "11:00 - 15:00",
    "onsdag": "11:00 - 15:00",
    "torsdag": "11:00 - 15:00",
    "fredag": "11:00 - 15:00",
    "lördag": "11:00 - 15:00",
    "söndag": "Stängt"
  }'::jsonb,
  'pokebowl'
),
(
  'malmo',
  'Malmö',
  'Moi Sushi Malmö',
  'Södergatan 15, 211 34, Malmö',
  '040-123456',
  'malmo@moisushi.se',
  'Vår nyöppnade restaurang i centrala Malmö. Modern design möter traditionell sushi-konst i en urban miljö.',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  55.6050,
  13.0038,
  '["delivery", "pickup", "dine-in"]'::jsonb,
  '["Modern design", "Sushi bar", "Poké bowls", "Cocktails", "Vegetariska alternativ"]'::jsonb,
  '{
    "måndag": "11:00 - 22:00",
    "tisdag": "11:00 - 22:00",
    "onsdag": "11:00 - 22:00",
    "torsdag": "11:00 - 22:00",
    "fredag": "11:00 - 23:00",
    "lördag": "12:00 - 23:00",
    "söndag": "15:00 - 21:00"
  }'::jsonb,
  'full'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  services = EXCLUDED.services,
  features = EXCLUDED.features,
  opening_hours = EXCLUDED.opening_hours,
  menu_type = EXCLUDED.menu_type,
  updated_at = NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 