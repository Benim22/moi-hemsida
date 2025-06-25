-- Test feedback-systemet
-- Kolla att tabellen finns
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback';

-- Kolla policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'feedback';

-- Testa att lägga till feedback (detta borde fungera för alla)
INSERT INTO feedback (type, message, status)
VALUES ('feedback', 'Test meddelande från SQL', 'new');

-- Kolla att det lades till
SELECT id, type, message, status, created_at FROM feedback ORDER BY created_at DESC LIMIT 1;

-- Rensa test-data
DELETE FROM feedback WHERE message = 'Test meddelande från SQL'; 