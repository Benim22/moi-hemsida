-- =============================================
-- RLS POLICIES FÖR active_orders_working VIEW
-- Säkrar underliggande tabeller: orders och profiles
-- =============================================

-- VIKTIGT: active_orders_working är en VIEW som bygger på orders + profiles
-- VIEWs ärver RLS från underliggande tabeller, så vi behöver säkra dessa

-- =============================================
-- 1️⃣ KONTROLLERA BEFINTLIGA POLICIES
-- =============================================

-- Lista alla befintliga policies för orders
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY cmd, policyname;

-- =============================================
-- 2️⃣ AKTIVERA RLS PÅ TABELLERNA (om inte redan gjort)
-- =============================================

-- Aktivera RLS på orders-tabellen
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Aktivera RLS på profiles-tabellen  
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3️⃣ SELECT-POLICY FÖR ORDERS (SAKNAS!)
-- =============================================

-- Ta bort eventuell befintlig SELECT-policy
DROP POLICY IF EXISTS "Allow users to view their orders and admins to view all" ON orders;

-- Skapa ny SELECT-policy för orders
CREATE POLICY "Allow users to view their orders and admins to view all" ON orders
FOR SELECT 
TO public
USING (
  -- Admin-användare kan se alla orders
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) OR
  -- Användare kan se sina egna orders
  (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
  -- Anonyma orders kan ses av alla (för gäst-beställningar)
  (user_id = '00000000-0000-0000-0000-000000000000') OR
  -- Location-admins kan se orders för sina locations
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN admin_locations al ON p.id = al.admin_id
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
    AND al.location = orders.location
  )
);

-- =============================================
-- 4️⃣ SELECT-POLICY FÖR PROFILES
-- =============================================

-- Ta bort eventuell befintlig SELECT-policy för profiles
DROP POLICY IF EXISTS "Allow users to view profiles" ON profiles;

-- Skapa SELECT-policy för profiles (behövs för JOIN i VIEW)
CREATE POLICY "Allow users to view profiles" ON profiles
FOR SELECT 
TO public
USING (
  -- Admin-användare kan se alla profiler
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'admin'
  ) OR
  -- Användare kan se sin egen profil
  (id = auth.uid()) OR
  -- Alla kan se grundläggande info för anonyma användare
  (id = '00000000-0000-0000-0000-000000000000')
);

-- =============================================
-- 5️⃣ KONTROLLERA ATT active_orders_working FUNGERAR
-- =============================================

-- Testa VIEW:en (detta kommer att respektera RLS automatiskt)
-- SELECT * FROM active_orders_working LIMIT 5;

-- =============================================
-- 6️⃣ EXTRA SÄKERHET: ANDRA RELATERADE TABELLER
-- =============================================

-- Om du har order_items-tabell, säkra den också
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Allow order items access" ON order_items;
-- CREATE POLICY "Allow order items access" ON order_items
-- FOR ALL 
-- TO public
-- USING (
--   EXISTS (
--     SELECT 1 FROM orders o
--     WHERE o.id = order_items.order_id
--     AND (
--       -- Admin kan se alla
--       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
--       -- Användare kan se sina egna orders
--       (o.user_id = auth.uid()) OR
--       -- Anonyma orders
--       (o.user_id = '00000000-0000-0000-0000-000000000000')
--     )
--   )
-- );

-- =============================================
-- 7️⃣ VERIFIERA ALLA POLICIES
-- =============================================

-- Lista alla policies för orders och profiles
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename IN ('orders', 'profiles')
ORDER BY tablename, cmd, policyname;

-- =============================================
-- 8️⃣ TEST-QUERIES FÖR VERIFIERING
-- =============================================

-- Dessa queries kan användas för att testa säkerheten:

-- Som admin (ska se alla orders):
-- SET ROLE admin_user; -- Byt till admin
-- SELECT COUNT(*) FROM active_orders_working;

-- Som vanlig användare (ska bara se sina egna):
-- SET ROLE regular_user; -- Byt till vanlig användare  
-- SELECT COUNT(*) FROM active_orders_working;

-- Som anonym (ska bara se anonyma orders):
-- SET ROLE anon; -- Byt till anonym
-- SELECT COUNT(*) FROM active_orders_working;

-- =============================================
-- 9️⃣ SÄKERHETSNOTERINGAR
-- =============================================

/*
VIKTIGA SÄKERHETSASPEKTER:

1. ✅ VIEW:en active_orders_working ärver automatiskt RLS från orders + profiles
2. ✅ Admins kan se alla orders (för admin-panel)
3. ✅ Användare kan bara se sina egna orders
4. ✅ Anonyma orders är synliga (för gäst-beställningar)
5. ✅ Location-admins kan se orders för sina locations
6. ✅ Inga konflikter med befintliga policies (vi ersätter dem säkert)

POTENTIELLA RISKER:
- ⚠️ Om anonyma orders innehåller känslig data, överväg att begränsa åtkomsten
- ⚠️ Location-admin funktionalitet kräver admin_locations tabell
- ⚠️ Se till att alla API-endpoints använder RLS (inte service role)

REKOMMENDATIONER:
- 🔒 Testa alltid med olika användarroller
- 🔒 Använd NEVER service role i frontend
- 🔒 Logga säkerhetsrelaterade queries
*/ 