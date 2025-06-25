-- Fix för saknade tabeller och 404/400 fel

-- 1. Skapa reward_programs tabell om den inte finns
CREATE TABLE IF NOT EXISTS reward_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  reward_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  reward_type VARCHAR(50) NOT NULL DEFAULT 'discount', -- discount, free_item, percentage
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- 2. Aktivera RLS för reward_programs
ALTER TABLE reward_programs ENABLE ROW LEVEL SECURITY;

-- 3. Skapa RLS policies för reward_programs
CREATE POLICY "Everyone can read active reward programs" ON reward_programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage reward programs" ON reward_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Lägg till några exempel belöningsprogram
INSERT INTO reward_programs (name, description, points_required, reward_value, reward_type, is_active) VALUES
('Välkomstbonus', '10% rabatt för nya kunder', 0, 10.00, 'percentage', true),
('Stamkund', '50 kr rabatt efter 10 beställningar', 100, 50.00, 'discount', true),
('Gratis Miso', 'Gratis miso soppa efter 5 beställningar', 50, 0, 'free_item', true)
ON CONFLICT DO NOTHING;

-- 5. Kontrollera analytics_page_views kolumner
DO $$
BEGIN
    -- Lägg till saknade kolumner om de inte finns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'user_id') THEN
        ALTER TABLE analytics_page_views ADD COLUMN user_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'session_id') THEN
        ALTER TABLE analytics_page_views ADD COLUMN session_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'page_url') THEN
        ALTER TABLE analytics_page_views ADD COLUMN page_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'page_title') THEN
        ALTER TABLE analytics_page_views ADD COLUMN page_title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'referrer') THEN
        ALTER TABLE analytics_page_views ADD COLUMN referrer TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'user_agent') THEN
        ALTER TABLE analytics_page_views ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'ip_address') THEN
        ALTER TABLE analytics_page_views ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'device_type') THEN
        ALTER TABLE analytics_page_views ADD COLUMN device_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'browser') THEN
        ALTER TABLE analytics_page_views ADD COLUMN browser VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'os') THEN
        ALTER TABLE analytics_page_views ADD COLUMN os VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'location') THEN
        ALTER TABLE analytics_page_views ADD COLUMN location VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'duration') THEN
        ALTER TABLE analytics_page_views ADD COLUMN duration INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_page_views' AND column_name = 'created_at') THEN
        ALTER TABLE analytics_page_views ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 6. Aktivera RLS för analytics_page_views om inte redan aktiverat
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;

-- 7. Skapa RLS policies för analytics_page_views
DROP POLICY IF EXISTS "Allow anonymous analytics inserts" ON analytics_page_views;
CREATE POLICY "Allow anonymous analytics inserts" ON analytics_page_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all analytics" ON analytics_page_views;
CREATE POLICY "Admins can read all analytics" ON analytics_page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. Index för prestanda
CREATE INDEX IF NOT EXISTS idx_reward_programs_active ON reward_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_programs_location ON reward_programs(location);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON analytics_page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON analytics_page_views(session_id);

-- 9. Skapa analytics_sessions tabell om den inte finns
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  screen_resolution VARCHAR(20),
  referrer TEXT,
  landing_page VARCHAR(255),
  page_views INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT true,
  is_returning_visitor BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Skapa analytics_events tabell om den inte finns
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  page_path VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Aktivera RLS för analytics tabeller
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 12. Skapa RLS policies för analytics_sessions
DROP POLICY IF EXISTS "Allow anonymous session inserts" ON analytics_sessions;
CREATE POLICY "Allow anonymous session inserts" ON analytics_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow session updates by session_id" ON analytics_sessions;
CREATE POLICY "Allow session updates by session_id" ON analytics_sessions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can read all sessions" ON analytics_sessions;
CREATE POLICY "Admins can read all sessions" ON analytics_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 13. Skapa RLS policies för analytics_events
DROP POLICY IF EXISTS "Allow anonymous event inserts" ON analytics_events;
CREATE POLICY "Allow anonymous event inserts" ON analytics_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all events" ON analytics_events;
CREATE POLICY "Admins can read all events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 14. Lägg till index för prestanda
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON analytics_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- 15. Kontrollera alla tabeller
SELECT 'reward_programs' as table_name, count(*) as row_count FROM reward_programs
UNION ALL
SELECT 'analytics_page_views' as table_name, count(*) as row_count FROM analytics_page_views
UNION ALL
SELECT 'analytics_sessions' as table_name, count(*) as row_count FROM analytics_sessions
UNION ALL
SELECT 'analytics_events' as table_name, count(*) as row_count FROM analytics_events; 