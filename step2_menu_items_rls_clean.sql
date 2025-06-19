-- =============================================
-- STEG 2: MENU_ITEMS RLS IMPLEMENTATION
-- SAKER SQL UTAN EMOJIS
-- =============================================

-- KONTROLLERA NUVARANDE STATUS
SELECT 
    'BEFORE' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'menu_items';

-- KONTROLLERA BEFINTLIGA POLICIES
SELECT 
    'BEFORE' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'menu_items';

-- =============================================
-- IMPLEMENTERA RLS SAKERHET
-- =============================================

BEGIN;

-- Aktivera RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: Alla kan lasa menu_items (for meny-visning)
CREATE POLICY "public_read_menu_items" ON menu_items
    FOR SELECT
    USING (true);

-- Policy 2: Admins kan hantera menu_items
CREATE POLICY "admin_manage_menu_items" ON menu_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- TESTA IMPLEMENTATION
SELECT 
    'TEST' as status,
    COUNT(*) as menu_items_count
FROM menu_items;

-- KONTROLLERA RLS AR AKTIVERAT
SELECT 
    'AFTER' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'menu_items';

-- KONTROLLERA POLICIES SKAPADES
SELECT 
    'AFTER' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'menu_items';

-- Om allt ser bra ut, committa
COMMIT;

-- =============================================
-- ROLLBACK VID PROBLEM
-- =============================================

/*
VID PROBLEM KOR DETTA:

BEGIN;
DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
DROP POLICY IF EXISTS "admin_manage_menu_items" ON menu_items;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
COMMIT;
*/ 