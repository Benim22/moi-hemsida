-- Feedback och buggrapporter tabell
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('feedback', 'bug', 'suggestion')),
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);

-- RLS (Row Level Security) policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy för att tillåta alla att skapa feedback (även anonyma användare)
CREATE POLICY "Allow anonymous feedback creation" ON feedback
    FOR INSERT 
    WITH CHECK (true);

-- Policy för att endast autentiserade admin-användare kan läsa feedback
CREATE POLICY "Allow admin to read feedback" ON feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy för att endast admin kan uppdatera feedback
CREATE POLICY "Allow admin to update feedback" ON feedback
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Trigger för att uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at_trigger
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

-- Kommentar för tabellen
COMMENT ON TABLE feedback IS 'Tabell för att lagra användarfeedback, buggrapporter och förslag';
COMMENT ON COLUMN feedback.type IS 'Typ av feedback: feedback, bug, suggestion';
COMMENT ON COLUMN feedback.status IS 'Status: new, in_progress, resolved, closed';
COMMENT ON COLUMN feedback.priority IS 'Prioritet: low, medium, high, critical'; 