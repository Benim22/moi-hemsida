-- RLS Policies för menu_items tabellen
-- Tillåter admin-användare att hantera menyobjekt

-- Aktivera RLS på menu_items tabellen (om inte redan aktiverat)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy för INSERT - endast admin-användare kan skapa nya menyobjekt
CREATE POLICY "Admins can insert menu items" ON menu_items
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy för UPDATE - endast admin-användare kan uppdatera menyobjekt
CREATE POLICY "Admins can update menu items" ON menu_items
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy för DELETE - endast admin-användare kan ta bort menyobjekt
CREATE POLICY "Admins can delete menu items" ON menu_items
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- SELECT policy finns redan: "Menu items are publicly readable"
-- Den tillåter alla att läsa menyobjekt, vilket är korrekt 