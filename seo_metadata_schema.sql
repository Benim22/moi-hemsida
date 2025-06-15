-- SEO Metadata Management Schema
-- Tabell för att hantera SEO-metadata för olika sidor och globala inställningar

-- 1. SEO Pages - Metadata för specifika sidor
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path VARCHAR(500) UNIQUE NOT NULL, -- '/menu', '/about', '/contact', etc.
    page_name VARCHAR(200) NOT NULL, -- 'Meny', 'Om oss', 'Kontakt'
    title VARCHAR(60), -- SEO title (max 60 tecken för Google)
    meta_description TEXT, -- Meta description (max 160 tecken)
    keywords TEXT, -- Kommaseparerade keywords
    og_title VARCHAR(60), -- Open Graph title
    og_description TEXT, -- Open Graph description
    og_image_url TEXT, -- Open Graph image URL
    canonical_url TEXT, -- Canonical URL för att undvika duplicate content
    robots VARCHAR(100) DEFAULT 'index,follow', -- Robots directive
    schema_markup JSONB, -- Structured data (JSON-LD)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SEO Global Settings - Globala SEO-inställningar
CREATE TABLE IF NOT EXISTS seo_global_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'url', 'json', 'boolean'
    description TEXT,
    category VARCHAR(50), -- 'general', 'social', 'analytics', 'technical'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SEO Keywords - Hantera keywords separat för bättre organisation
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword VARCHAR(200) NOT NULL,
    search_volume INTEGER, -- Uppskattad sökvolym
    difficulty INTEGER, -- Keyword difficulty (1-100)
    category VARCHAR(100), -- 'sushi', 'restaurant', 'malmö', etc.
    target_pages TEXT[], -- Array av sidor som ska targeta detta keyword
    notes TEXT,
    is_primary BOOLEAN DEFAULT false, -- Primärt keyword för företaget
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SEO Analytics - Spåra SEO-prestanda
CREATE TABLE IF NOT EXISTS seo_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path VARCHAR(500) NOT NULL,
    keyword VARCHAR(200),
    search_engine VARCHAR(50) DEFAULT 'google',
    position INTEGER, -- Ranking position
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_path, keyword, search_engine, date)
);

-- Skapa index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_seo_pages_path ON seo_pages(page_path);
CREATE INDEX IF NOT EXISTS idx_seo_pages_active ON seo_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_seo_global_key ON seo_global_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_seo_global_category ON seo_global_settings(category);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_category ON seo_keywords(category);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_primary ON seo_keywords(is_primary);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_page ON seo_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON seo_analytics(date);

-- Lägg till grundläggande SEO-sidor
INSERT INTO seo_pages (page_path, page_name, title, meta_description, keywords) VALUES
('/menu', 'Meny', 'Moi Sushi Meny - Färsk Sushi & Poké Bowls i Malmö', 'Upptäck vår exklusiva sushi-meny med färska råvaror. Beställ online för avhämtning eller leverans i Malmö, Trelleborg och Ystad.', 'sushi malmö, poké bowl, japansk mat, sushi beställning, moi sushi'),
('/', 'Hem', 'Moi Sushi - Bästa Sushi i Malmö | Färsk Japansk Mat', 'Moi Sushi erbjuder autentisk japansk mat med färska råvaror. Beställ sushi, poké bowls och mer online. Snabb leverans i Malmö, Trelleborg och Ystad.', 'sushi malmö, japansk restaurang, sushi leverans, poké bowl malmö, moi sushi'),
('/about', 'Om Oss', 'Om Moi Sushi - Vår Historia & Passion för Japansk Mat', 'Lär dig mer om Moi Sushi, vår passion för autentisk japansk mat och vårt engagemang för kvalitet och färskhet.', 'om moi sushi, japansk mat malmö, sushi restaurang historia'),
('/contact', 'Kontakt', 'Kontakta Moi Sushi - Beställning & Information', 'Kontakta Moi Sushi för beställningar, frågor eller feedback. Vi finns i Malmö, Trelleborg och Ystad.', 'kontakt moi sushi, sushi beställning malmö, restaurang kontakt')
ON CONFLICT (page_path) DO NOTHING;

-- Lägg till globala SEO-inställningar
INSERT INTO seo_global_settings (setting_key, setting_value, setting_type, description, category) VALUES
('site_name', 'Moi Sushi', 'text', 'Webbplatsens namn', 'general'),
('site_description', 'Moi Sushi - Autentisk japansk mat med färska råvaror i Malmö, Trelleborg och Ystad', 'text', 'Global beskrivning av webbplatsen', 'general'),
('default_og_image', 'https://example.com/moi-sushi-og-image.jpg', 'url', 'Standard Open Graph bild', 'social'),
('google_analytics_id', '', 'text', 'Google Analytics tracking ID', 'analytics'),
('google_search_console', '', 'text', 'Google Search Console verification code', 'analytics'),
('facebook_app_id', '', 'text', 'Facebook App ID för Open Graph', 'social'),
('twitter_handle', '@moisushi', 'text', 'Twitter handle för företaget', 'social'),
('business_type', 'Restaurant', 'text', 'Typ av företag för schema markup', 'technical'),
('business_phone', '+46 40 123 456', 'text', 'Företagets telefonnummer', 'general'),
('business_email', 'info@moisushi.se', 'text', 'Företagets e-postadress', 'general'),
('business_address', 'Malmö, Sverige', 'text', 'Företagets adress', 'general')
ON CONFLICT (setting_key) DO NOTHING;

-- Lägg till grundläggande keywords
INSERT INTO seo_keywords (keyword, category, is_primary, target_pages, search_volume, difficulty) VALUES
('sushi malmö', 'location', true, ARRAY['/', '/menu'], 1200, 45),
('poké bowl malmö', 'location', true, ARRAY['/', '/menu'], 800, 35),
('japansk mat malmö', 'cuisine', true, ARRAY['/', '/about'], 600, 40),
('sushi leverans', 'service', false, ARRAY['/', '/menu'], 900, 50),
('moi sushi', 'brand', true, ARRAY['/', '/about', '/contact'], 500, 20),
('sushi beställning online', 'service', false, ARRAY['/', '/menu'], 700, 55),
('bästa sushi malmö', 'quality', false, ARRAY['/', '/menu'], 400, 60),
('färsk sushi', 'quality', false, ARRAY['/', '/menu', '/about'], 300, 30)
ON CONFLICT DO NOTHING;

-- Skapa funktion för att uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Skapa triggers för automatisk uppdatering av updated_at
CREATE TRIGGER trigger_seo_pages_updated_at
    BEFORE UPDATE ON seo_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER trigger_seo_global_updated_at
    BEFORE UPDATE ON seo_global_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER trigger_seo_keywords_updated_at
    BEFORE UPDATE ON seo_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_updated_at();

-- Kommentarer för tabellernas syfte
COMMENT ON TABLE seo_pages IS 'SEO metadata för specifika sidor på webbplatsen';
COMMENT ON TABLE seo_global_settings IS 'Globala SEO-inställningar och konfiguration';
COMMENT ON TABLE seo_keywords IS 'Keyword management och tracking';
COMMENT ON TABLE seo_analytics IS 'SEO prestanda och ranking data'; 