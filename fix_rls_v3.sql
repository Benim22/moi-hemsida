-- =============================================
-- FIX RLS POLICIES FÖR ORDERS UPDATE
-- Tillåter admin-användare att uppdatera orders
-- =============================================

-- Skapa UPDATE-policy för orders-tabellen
-- Tillåter admin-användare att uppdatera alla orders
-- Tillåter vanliga användare att uppdatera sina egna orders
CREATE POLICY "Allow admin and user order updates" ON orders
FOR UPDATE 
TO public
USING (
  -- Admin-användare kan uppdatera alla orders
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) OR
  -- Användare kan uppdatera sina egna orders
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
  -- Anonyma orders kan uppdateras av alla (för gäst-beställningar)
  (user_id = '00000000-0000-0000-0000-000000000000')
)
WITH CHECK (
  -- Samma villkor för WITH CHECK
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) OR
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
  (user_id = '00000000-0000-0000-0000-000000000000')
);

-- Lägg även till DELETE-policy för fullständighet
CREATE POLICY "Allow admin order deletion" ON orders
FOR DELETE 
TO public
USING (
  -- Endast admin-användare kan ta bort orders
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verifiera att alla policies är på plats
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY cmd, policyname; 