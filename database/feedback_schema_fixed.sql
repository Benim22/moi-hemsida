-- Ta bort gamla policies först
DROP POLICY IF EXISTS "Allow admin to read feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admin to update feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback creation" ON feedback;

-- Skapa nya korrekta policies
CREATE POLICY "Allow anonymous feedback creation" ON feedback
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow admin to read feedback" ON feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin to update feedback" ON feedback
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin to delete feedback" ON feedback
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Kontrollera att tabellen har RLS aktiverat
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Skapa indexes om de inte finns
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Uppdatera trigger för updated_at om den inte finns
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feedback_updated_at_trigger ON feedback;
CREATE TRIGGER feedback_updated_at_trigger
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at(); 