-- Reward programs tabell
CREATE TABLE IF NOT EXISTS reward_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_required INTEGER DEFAULT 0,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('discount', 'free_item', 'points')),
    reward_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_reward_programs_active ON reward_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_programs_created_at ON reward_programs(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE reward_programs ENABLE ROW LEVEL SECURITY;

-- Policy för att tillåta alla att läsa aktiva belöningsprogram
CREATE POLICY "Allow public to read active reward programs" ON reward_programs
    FOR SELECT
    USING (is_active = true);

-- Policy för att endast admin kan hantera belöningsprogram
CREATE POLICY "Allow admin to manage reward programs" ON reward_programs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Trigger för att uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_reward_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reward_programs_updated_at_trigger
    BEFORE UPDATE ON reward_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_reward_programs_updated_at();

-- Lägg till några exempel belöningsprogram
INSERT INTO reward_programs (name, description, points_required, reward_type, reward_value, is_active) VALUES
('Välkomstbonus', 'Få 10% rabatt på din första beställning', 0, 'discount', 10.00, true),
('Stammiskund', 'Gratis poké bowl efter 10 beställningar', 100, 'free_item', 0.00, true),
('Stor beställning', '15% rabatt på beställningar över 500kr', 50, 'discount', 15.00, true)
ON CONFLICT DO NOTHING;

-- Kommentar för tabellen
COMMENT ON TABLE reward_programs IS 'Tabell för belöningsprogram och kampanjer';
COMMENT ON COLUMN reward_programs.reward_type IS 'Typ av belöning: discount, free_item, points';
COMMENT ON COLUMN reward_programs.reward_value IS 'Värde av belöningen (procent för discount, belopp för free_item)';
COMMENT ON COLUMN reward_programs.is_active IS 'Om belöningsprogrammet är aktivt eller inte'; 