-- =============================================
-- STEG 1: LOCATIONS RLS IMPLEMENTATION
-- SAKER OCH REN SQL UTAN EMOJIS
-- =============================================

-- KONTROLLERA NUVARANDE STATUS
SELECT 
    'BEFORE' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'locations';

-- KONTROLLERA BEFINTLIGA POLICIES
SELECT 
    'BEFORE' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'locations';

-- =============================================
-- IMPLEMENTERA RLS SAKERHET
-- =============================================

BEGIN;

-- Aktivera RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Alla kan lasa locations (for platsvaljare)
CREATE POLICY "public_read_locations" ON locations
    FOR SELECT
    USING (true);

-- Policy 2: Admins kan hantera locations
CREATE POLICY "admin_manage_locations" ON locations
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
    COUNT(*) as location_count
FROM locations;

-- KONTROLLERA RLS AR AKTIVERAT
SELECT 
    'AFTER' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'locations';

-- KONTROLLERA POLICIES SKAPADES
SELECT 
    'AFTER' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'locations';

-- Om allt ser bra ut, committa
COMMIT;

-- =============================================
-- ROLLBACK VID PROBLEM
-- =============================================

/*
VID PROBLEM KOR DETTA:

BEGIN;
DROP POLICY IF EXISTS "public_read_locations" ON locations;
DROP POLICY IF EXISTS "admin_manage_locations" ON locations;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
COMMIT;
*/ 