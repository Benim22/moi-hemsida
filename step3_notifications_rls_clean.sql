-- =============================================
-- STEG 3: NOTIFICATIONS RLS IMPLEMENTATION
-- SAKER SQL UTAN EMOJIS
-- =============================================

-- KONTROLLERA NUVARANDE STATUS
SELECT 
    'BEFORE' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'notifications';

-- KONTROLLERA BEFINTLIGA POLICIES
SELECT 
    'BEFORE' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'notifications';

-- KONTROLLERA TABELLSTRUKTUR (for att se user_id kolumn)
SELECT 
    'STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id', 'message', 'read', 'created_at')
ORDER BY ordinal_position;

-- =============================================
-- IMPLEMENTERA RLS SAKERHET
-- =============================================

BEGIN;

-- Aktivera RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anvandare kan se sina egna notifications
CREATE POLICY "users_read_own_notifications" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Anvandare kan uppdatera sina egna notifications (markera som lasta)
CREATE POLICY "users_update_own_notifications" ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Admins kan se alla notifications
CREATE POLICY "admin_read_all_notifications" ON notifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 4: Admins kan skapa notifications for alla anvandare
CREATE POLICY "admin_create_notifications" ON notifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 5: Admins kan uppdatera alla notifications
CREATE POLICY "admin_update_all_notifications" ON notifications
    FOR UPDATE
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
    COUNT(*) as notifications_count
FROM notifications;

-- KONTROLLERA RLS AR AKTIVERAT
SELECT 
    'AFTER' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'notifications';

-- KONTROLLERA POLICIES SKAPADES
SELECT 
    'AFTER' as status,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'notifications';

-- Om allt ser bra ut, committa
COMMIT;

-- =============================================
-- ROLLBACK VID PROBLEM
-- =============================================

/*
VID PROBLEM KOR DETTA:

BEGIN;
DROP POLICY IF EXISTS "users_read_own_notifications" ON notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;
DROP POLICY IF EXISTS "admin_read_all_notifications" ON notifications;
DROP POLICY IF EXISTS "admin_create_notifications" ON notifications;
DROP POLICY IF EXISTS "admin_update_all_notifications" ON notifications;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
COMMIT;
*/ 