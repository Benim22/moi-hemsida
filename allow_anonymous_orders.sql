-- =============================================
-- TILLÅT ANONYMA BESTÄLLNINGAR UTAN BEGRÄNSNING
-- Tar bort 250kr-gränsen för anonyma beställningar
-- =============================================

-- Ta bort gamla INSERT-policyn
DROP POLICY IF EXISTS "Allow user orders and anonymous under 250kr" ON orders;

-- Skapa ny policy som tillåter alla anonyma beställningar
CREATE POLICY "Allow all user and anonymous orders" ON orders
FOR INSERT 
TO public
WITH CHECK (
  -- Inloggade användare kan skapa orders för sig själva
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR 
  -- Anonyma användare kan skapa orders utan begränsning
  (user_id = '00000000-0000-0000-0000-000000000000')
);

-- Verifiera att policyn är skapad
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders' AND cmd = 'INSERT'; 