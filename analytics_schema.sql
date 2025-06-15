-- Moi Sushi Analytics Schema
-- Skapa alla tabeller för eget Analytics-system

-- 1. Analytics Sessions - Spårar användarsessioner
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(20), -- '1920x1080'
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    landing_page VARCHAR(500),
    exit_page VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration INTEGER DEFAULT 0, -- i sekunder
    page_views INTEGER DEFAULT 0,
    is_bounce BOOLEAN DEFAULT true,
    is_returning_visitor BOOLEAN DEFAULT false
);

-- 2. Analytics Events - Spårar specifika händelser
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'click', 'scroll', 'menu_view', 'order_start', etc.
    event_name VARCHAR(200),
    page_path VARCHAR(500),
    element_id VARCHAR(200),
    element_class VARCHAR(200),
    element_text TEXT,
    x_coordinate INTEGER, -- för klick-tracking
    y_coordinate INTEGER,
    scroll_depth INTEGER, -- procent (0-100)
    time_on_page INTEGER, -- sekunder innan event
    metadata JSONB, -- för extra data som menu_item_id, category, price, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- 3. Analytics Page Views - Detaljerad sidspårning
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    page_load_time INTEGER, -- millisekunder
    time_on_page INTEGER, -- sekunder
    max_scroll_depth INTEGER, -- procent (0-100)
    clicks_on_page INTEGER DEFAULT 0,
    is_exit_page BOOLEAN DEFAULT false,
    previous_page VARCHAR(500),
    next_page VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_pageview_session FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- 4. Analytics Menu Interactions - Spårar meny-specifika händelser
CREATE TABLE IF NOT EXISTS analytics_menu_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    menu_item_id UUID,
    interaction_type VARCHAR(50), -- 'view', 'click', 'add_to_cart', 'favorite'
    category VARCHAR(100),
    item_name VARCHAR(200),
    item_price DECIMAL(10,2),
    time_spent_viewing INTEGER, -- sekunder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_menu_session FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
);

-- 5. Analytics Daily Stats - Dagliga sammanfattningar
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_sessions INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    returning_visitors INTEGER DEFAULT 0,
    total_page_views INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    avg_pages_per_session DECIMAL(5,2) DEFAULT 0,
    top_pages JSONB, -- [{"path": "/menu", "views": 150}, ...]
    top_referrers JSONB,
    device_breakdown JSONB, -- {"desktop": 60, "mobile": 35, "tablet": 5}
    browser_breakdown JSONB,
    popular_menu_items JSONB,
    peak_hours JSONB, -- {"hour": 18, "sessions": 45}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Analytics Real-time Stats - För live dashboard
CREATE TABLE IF NOT EXISTS analytics_realtime_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active_sessions INTEGER DEFAULT 0,
    current_page_views JSONB, -- aktiva sidor just nu
    recent_events JSONB, -- senaste events (senaste 5 min)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skapa index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON analytics_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_menu_interactions_session_id ON analytics_menu_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_menu_interactions_menu_item_id ON analytics_menu_interactions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_stats_date ON analytics_daily_stats(date);

-- Skapa funktioner för automatisk uppdatering av daglig statistik
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Uppdatera daglig statistik när nya sessioner skapas
    INSERT INTO analytics_daily_stats (date, total_sessions, unique_visitors)
    VALUES (CURRENT_DATE, 1, 1)
    ON CONFLICT (date) 
    DO UPDATE SET 
        total_sessions = analytics_daily_stats.total_sessions + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Skapa trigger för automatisk uppdatering
CREATE TRIGGER trigger_update_daily_stats
    AFTER INSERT ON analytics_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- Skapa funktion för att rensa gamla data (GDPR-compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
    -- Ta bort data äldre än 2 år
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM analytics_page_views WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM analytics_menu_interactions WHERE created_at < NOW() - INTERVAL '2 years';
    DELETE FROM analytics_sessions WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Ta bort real-time data äldre än 1 dag
    DELETE FROM analytics_realtime_stats WHERE timestamp < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Kommentarer för tabellernas syfte:
COMMENT ON TABLE analytics_sessions IS 'Spårar användarsessioner med device info, location, referrer etc.';
COMMENT ON TABLE analytics_events IS 'Spårar alla användarinteraktioner som klick, scroll, meny-views etc.';
COMMENT ON TABLE analytics_page_views IS 'Detaljerad spårning av sidvisningar med tid och scroll-djup';
COMMENT ON TABLE analytics_menu_interactions IS 'Specifik spårning av meny-interaktioner för restaurang-insights';
COMMENT ON TABLE analytics_daily_stats IS 'Dagliga sammanfattningar för snabb rapportering';
COMMENT ON TABLE analytics_realtime_stats IS 'Real-time data för live dashboard'; 