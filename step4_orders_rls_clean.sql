-- =============================================
-- STEG 4: ORDERS RLS IMPLEMENTATION (KRITISK)
-- SAKER SQL UTAN EMOJIS - VAR FORSIKTIG!
-- =============================================

-- VIKTIGT: Detta ar den mest kritiska tabellen!
-- Testa grundligt efter implementation!

-- KONTROLLERA NUVARANDE STATUS
SELECT 
    'BEFORE' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'orders';

-- KONTROLLERA BEFINTLIGA POLICIES
SELECT 
    'BEFORE' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'orders';

-- KONTROLLERA TABELLSTRUKTUR
SELECT 
    'STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id', 'location', 'status', 'created_at', 'customer_email')
ORDER BY ordinal_position;

-- =============================================
-- IMPLEMENTERA RLS SAKERHET
-- =============================================

BEGIN;

-- Aktivera RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anvandare kan se sina egna orders
CREATE POLICY "users_read_own_orders" ON orders
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR 
        -- Anonyma orders kan ses av alla autentiserade (for gast-bestallningar)
        (user_id IS NULL AND auth.uid() IS NOT NULL)
    );

-- Policy 2: Anvandare kan skapa sina egna orders
CREATE POLICY "users_create_own_orders" ON orders
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR
        -- Tillat anonyma orders (user_id kan vara NULL)
        user_id IS NULL
    );

-- Policy 3: Anvandare kan uppdatera sina egna orders (begransat)
CREATE POLICY "users_update_own_orders" ON orders
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        -- Anonyma orders kan uppdateras av alla (for gast-bestallningar)
        user_id IS NULL
    )
    WITH CHECK (
        auth.uid() = user_id
        OR
        user_id IS NULL
    );

-- Policy 4: Admins kan se alla orders
CREATE POLICY "admin_read_all_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 5: Admins kan uppdatera alla orders
CREATE POLICY "admin_update_all_orders" ON orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 6: Admins kan skapa orders for alla
CREATE POLICY "admin_create_all_orders" ON orders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 7: Location-admins kan se orders for sina platser
CREATE POLICY "location_admin_read_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_locations al
            WHERE al.admin_id = auth.uid()
            AND al.location_id::text = orders.location
        )
    );

-- Policy 8: Location-admins kan uppdatera orders for sina platser
CREATE POLICY "location_admin_update_orders" ON orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_locations al
            WHERE al.admin_id = auth.uid()
            AND al.location_id::text = orders.location
        )
    );

-- TESTA IMPLEMENTATION - KRITISKT!
SELECT 
    'TEST' as status,
    COUNT(*) as orders_count,
    COUNT(*) FILTER (WHERE user_id IS NULL) as anonymous_orders,
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as user_orders
FROM orders;

-- KONTROLLERA RLS AR AKTIVERAT
SELECT 
    'AFTER' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'orders';

-- KONTROLLERA POLICIES SKAPADES
SELECT 
    'AFTER' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- KRITISK TEST: Kontrollera att vi fortfarande kan lasa orders
DO $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO order_count FROM orders;
    IF order_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Can still read % orders', order_count;
    ELSE
        RAISE EXCEPTION 'ERROR: Cannot read orders - ROLLBACK NEEDED!';
    END IF;
END $$;

-- Om allt ser bra ut, committa
COMMIT;

-- =============================================
-- ROLLBACK VID PROBLEM - KRITISKT!
-- =============================================

/*
VID PROBLEM KOR DETTA OMEDELBART:

BEGIN;
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
DROP POLICY IF EXISTS "users_create_own_orders" ON orders;
DROP POLICY IF EXISTS "users_update_own_orders" ON orders;
DROP POLICY IF EXISTS "admin_read_all_orders" ON orders;
DROP POLICY IF EXISTS "admin_update_all_orders" ON orders;
DROP POLICY IF EXISTS "admin_create_all_orders" ON orders;
DROP POLICY IF EXISTS "location_admin_read_orders" ON orders;
DROP POLICY IF EXISTS "location_admin_update_orders" ON orders;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
COMMIT;

-- Testa att orders fungerar igen:
SELECT COUNT(*) FROM orders;
*/ 