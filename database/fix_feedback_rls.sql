-- Ta bort alla befintliga policies för feedback
DROP POLICY IF EXISTS "Allow admin to read feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admin to update feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admin to delete feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback creation" ON feedback;

-- Skapa nya korrekta policies
-- 1. Tillåt alla att skapa feedback (anonymt)
CREATE POLICY "Allow anyone to create feedback" ON feedback
    FOR INSERT 
    WITH CHECK (true);

-- 2. Tillåt admin att läsa all feedback
CREATE POLICY "Allow admin to read all feedback" ON feedback
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 3. Tillåt admin att uppdatera feedback
CREATE POLICY "Allow admin to update all feedback" ON feedback
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Tillåt admin att ta bort feedback
CREATE POLICY "Allow admin to delete all feedback" ON feedback
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ); 