-- Ta bort gamla INSERT-policyn
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;

-- Skapa ny policy som tillåter anonyma beställningar under 250kr
CREATE POLICY "Allow user orders and anonymous under 250kr" ON orders
FOR INSERT 
TO public
WITH CHECK (
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR 
  (user_id = '00000000-0000-0000-0000-000000000000' AND total_price < 250)
);

-- Uppdatera SELECT-policyn också
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Users can view their own orders and anonymous orders" ON orders
FOR SELECT 
TO public
USING (
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
  (user_id = '00000000-0000-0000-0000-000000000000')
); 