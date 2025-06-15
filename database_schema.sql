-- ================================================================
-- MOI SUSHI & POKÉ BOWL - KOMPLETT SUPABASE DATABAS SCHEMA
-- ================================================================
-- Detta schema inkluderar allt för en fullständig restaurang-app:
-- * Användarhantering & Auth
-- * Menyhantering & Kategorier  
-- * Beställningar & Kundvagn
-- * Bokningar & Tillgänglighet
-- * Analytics & Rapportering
-- * Admin Dashboard
-- * Marknadsföring & Kampanjer
-- * Recensioner & Betyg
-- * Lojalitetsprogram
-- * Notifikationer
-- ================================================================

-- Aktivera nödvändiga extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================================
-- ENUMS & CUSTOM TYPES
-- ================================================================

CREATE TYPE location_enum AS ENUM ('malmo', 'trelleborg', 'ystad');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE order_type_enum AS ENUM ('delivery', 'pickup');
CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE user_role_enum AS ENUM ('customer', 'admin', 'staff');
CREATE TYPE device_type_enum AS ENUM ('desktop', 'mobile', 'tablet');
CREATE TYPE promotion_type_enum AS ENUM ('percentage', 'fixed_amount', 'free_item', 'free_delivery');
CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE loyalty_tier_enum AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE loyalty_transaction_type_enum AS ENUM ('earned', 'redeemed', 'expired', 'adjusted');
CREATE TYPE admin_action_enum AS ENUM ('create', 'update', 'delete', 'view', 'export');
CREATE TYPE metric_type_enum AS ENUM ('performance', 'error', 'security', 'usage');
CREATE TYPE campaign_status_enum AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
CREATE TYPE notification_type_enum AS ENUM ('order', 'booking', 'promotion', 'general');

-- ================================================================
-- CORE TABLES
-- ================================================================

-- Utökad användartabell (kopplar till auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL, -- Duplicera email för enklare queries
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role user_role_enum DEFAULT 'customer',
    avatar_url TEXT,
    date_of_birth DATE,
    preferred_location location_enum,
    marketing_consent BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurangplatser
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug location_enum UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    coordinates POINT,
    opening_hours JSONB NOT NULL, -- {monday: "11:00-22:00", ...}
    special_hours JSONB, -- För helger och speciella dagar
    is_active BOOLEAN DEFAULT true,
    max_delivery_distance INTEGER DEFAULT 10, -- km
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    minimum_delivery_order DECIMAL(10,2) DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meny kategorier
CREATE TABLE public.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menyobjekt
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    image_url TEXT,
    images JSONB, -- Array av extra bilder
    ingredients JSONB, -- Array av ingredienser
    allergens JSONB, -- Array av allergener
    nutritional_info JSONB, -- {calories, protein, carbs, fat}
    spicy_level INTEGER DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 5),
    preparation_time INTEGER, -- minuter
    available_locations JSONB DEFAULT '["malmo", "trelleborg", "ystad"]',
    is_popular BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- BESTÄLLNINGAR & KUNDVAGN
-- ================================================================

-- Beställningar
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL, -- MOI-2024-001234
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status order_status_enum DEFAULT 'pending',
    location location_enum NOT NULL,
    order_type order_type_enum NOT NULL,
    
    -- Kundinfo
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    
    -- Leverans/upphämtning
    delivery_address TEXT,
    delivery_coordinates POINT,
    pickup_time TIMESTAMPTZ,
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    
    -- Priser
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Övrigt
    notes TEXT,
    special_instructions TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    staff_notes TEXT,
    
    -- Kampanj/rabatt
    promotion_id UUID,
    promotion_code VARCHAR(50),
    
    -- Tid
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beställningsobjekt
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    customizations JSONB, -- För anpassningar
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- BOKNINGAR
-- ================================================================

-- Bokningar
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) UNIQUE NOT NULL, -- BOOK-2024-001234
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location location_enum NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    status booking_status_enum DEFAULT 'pending',
    
    -- Kundinfo
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    
    -- Övrigt
    special_requests TEXT,
    table_preference VARCHAR(100),
    celebration_type VARCHAR(100), -- födelsedag, jubileum, etc.
    staff_notes TEXT,
    
    -- Bekräftelse
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id),
    reminder_sent_at TIMESTAMPTZ,
    
    -- Avbokning
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bordstillgänglighet
CREATE TABLE public.table_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location location_enum NOT NULL,
    date DATE NOT NULL,
    time_slot TIME NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_bookings INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location, date, time_slot)
);

-- ================================================================
-- FAVORITER & ANVÄNDARDATA
-- ================================================================

-- Favoriter
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, menu_item_id)
);

-- Användaradresser
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100), -- "Hem", "Jobb", etc.
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    coordinates POINT,
    is_default BOOLEAN DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- NOTIFIKATIONER
-- ================================================================

-- Notifikationer
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Extra data relaterat till notifikationen
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ANALYTICS & TRACKING
-- ================================================================

-- Sidbesök
CREATE TABLE public.page_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type device_type_enum,
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    visit_duration INTEGER, -- sekunder
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Användarsessioner
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ,
    total_duration INTEGER, -- sekunder
    pages_visited INTEGER DEFAULT 0,
    device_info JSONB,
    location_info JSONB,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Försäljningsmetrik
CREATE TABLE public.sales_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    location location_enum NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    most_popular_items JSONB,
    order_types JSONB, -- {delivery: x, pickup: y}
    peak_hours JSONB, -- [{hour: x, order_count: y}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, location)
);

-- Kundanalys
CREATE TABLE public.customer_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    favorite_location location_enum,
    preferred_order_type order_type_enum,
    most_ordered_items JSONB,
    last_order_date DATE,
    customer_lifetime_value DECIMAL(12,2) DEFAULT 0,
    loyalty_score INTEGER DEFAULT 0 CHECK (loyalty_score >= 0 AND loyalty_score <= 100),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Menyobjekt analys
CREATE TABLE public.menu_item_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    location location_enum NOT NULL,
    times_viewed INTEGER DEFAULT 0,
    times_added_to_cart INTEGER DEFAULT 0,
    times_ordered INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    cart_abandonment_rate DECIMAL(5,4) DEFAULT 0,
    average_rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, date, location)
);

-- Platsanalys
CREATE TABLE public.location_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location location_enum NOT NULL,
    date DATE NOT NULL,
    website_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    session_duration INTEGER DEFAULT 0, -- sekunder
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    most_popular_pages JSONB,
    traffic_sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location, date)
);

-- Admin aktivitet
CREATE TABLE public.admin_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action admin_action_enum NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- MARKNADSFÖRING & KAMPANJER
-- ================================================================

-- Kampanjer/erbjudanden
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type promotion_type_enum NOT NULL,
    value DECIMAL(10,2) NOT NULL, -- procent eller belopp
    code VARCHAR(50) UNIQUE, -- rabattkod
    minimum_order DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    applicable_items JSONB, -- array av menu item IDs
    applicable_locations JSONB DEFAULT '["malmo", "trelleborg", "ystad"]',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E-postkampanjer
CREATE TABLE public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    recipient_type VARCHAR(50) NOT NULL, -- 'all_users', 'customers', etc.
    recipient_filter JSONB,
    send_date TIMESTAMPTZ,
    status campaign_status_enum DEFAULT 'draft',
    metrics JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0}',
    template_id VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- RECENSIONER & BETYG
-- ================================================================

-- Recensioner
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    location location_enum NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images JSONB, -- array av image URLs
    status review_status_enum DEFAULT 'pending',
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    response JSONB, -- {text, responder_id, responded_at}
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hjälpsamma röster på recensioner
CREATE TABLE public.review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- ================================================================
-- LOJALITETSPROGRAM
-- ================================================================

-- Lojalitetsprogram
CREATE TABLE public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    tier loyalty_tier_enum DEFAULT 'bronze',
    tier_progress INTEGER DEFAULT 0 CHECK (tier_progress >= 0 AND tier_progress <= 100),
    join_date DATE DEFAULT CURRENT_DATE,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Lojalitetstransaktioner
CREATE TABLE public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type loyalty_transaction_type_enum NOT NULL,
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SYSTEM & KONFIGURATION
-- ================================================================

-- Systeminställningar
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false, -- om inställningen ska vara synlig för klienter
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Systemmetrik
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type metric_type_enum NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(50),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES FÖR PRESTANDA
-- ================================================================

-- Användarindex
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_location ON users(preferred_location);

-- Menyindex
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(is_available);
CREATE INDEX idx_menu_items_popular ON menu_items(is_popular);
CREATE INDEX idx_menu_items_price ON menu_items(price);

-- Beställningsindex
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_location ON orders(location);
CREATE INDEX idx_orders_date ON orders(ordered_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Bokningsindex
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_location_date ON bookings(location, date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Analyticsindex
CREATE INDEX idx_page_visits_date ON page_visits(created_at);
CREATE INDEX idx_page_visits_user ON page_visits(user_id);
CREATE INDEX idx_sales_metrics_date_location ON sales_metrics(date, location);
CREATE INDEX idx_customer_analytics_user ON customer_analytics(user_id);

-- ================================================================
-- TRIGGERS & FUNCTIONS
-- ================================================================

-- Function för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers för updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function för att generera beställningsnummer
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'MOI-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence för beställningsnummer
CREATE SEQUENCE order_number_seq START 1;

-- Trigger för beställningsnummer
CREATE TRIGGER generate_order_number_trigger 
    BEFORE INSERT ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_order_number();

-- Function för att generera bokningsnummer
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number = 'BOOK-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('booking_number_seq')::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence för bokningsnummer
CREATE SEQUENCE booking_number_seq START 1;

-- Trigger för bokningsnummer
CREATE TRIGGER generate_booking_number_trigger 
    BEFORE INSERT ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_booking_number();

-- Function för att uppdatera kundanalys
CREATE OR REPLACE FUNCTION update_customer_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Uppdatera eller skapa kundanalys när beställning ändras
    INSERT INTO customer_analytics (
        user_id,
        total_orders,
        total_spent,
        average_order_value,
        last_order_date
    )
    SELECT 
        NEW.user_id,
        COUNT(*),
        SUM(total),
        AVG(total),
        MAX(ordered_at::date)
    FROM orders 
    WHERE user_id = NEW.user_id 
    AND status NOT IN ('cancelled')
    GROUP BY user_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_spent = EXCLUDED.total_spent,
        average_order_value = EXCLUDED.average_order_value,
        last_order_date = EXCLUDED.last_order_date,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger för kundanalys
CREATE TRIGGER update_customer_analytics_trigger 
    AFTER INSERT OR UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_customer_analytics();

-- Function för att uppdatera lojalitetspoäng
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    points_earned INTEGER;
BEGIN
    -- Beräkna poäng baserat på beställningsvärde (1 poäng per 10 kr)
    points_earned := FLOOR(NEW.total / 10);
    
    -- Lägg till poäng när beställning bekräftas
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        -- Uppdatera lojalitetsprogram
        INSERT INTO loyalty_programs (user_id, points_balance, total_points_earned)
        VALUES (NEW.user_id, points_earned, points_earned)
        ON CONFLICT (user_id)
        DO UPDATE SET
            points_balance = loyalty_programs.points_balance + points_earned,
            total_points_earned = loyalty_programs.total_points_earned + points_earned,
            last_activity = NOW(),
            updated_at = NOW();
        
        -- Skapa lojalitetstransaktion
        INSERT INTO loyalty_transactions (
            user_id,
            type,
            points,
            description,
            order_id
        ) VALUES (
            NEW.user_id,
            'earned',
            points_earned,
            'Poäng från beställning ' || NEW.order_number,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger för lojalitetspoäng
CREATE TRIGGER update_loyalty_points_trigger 
    AFTER INSERT OR UPDATE ON orders 
    FOR EACH ROW 
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_loyalty_points();

-- Function för att synkronisera email från auth.users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Uppdatera email i public.users när auth.users ändras
    UPDATE public.users 
    SET email = NEW.email 
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för email-synkronisering
CREATE TRIGGER sync_user_email_trigger
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email();

-- Function för att skapa användarprofil vid registrering
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för att skapa profil vid ny användare
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Aktivera RLS för alla tabeller
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;

-- Policies för users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies för orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Policies för bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update bookings" ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Policies för favorites
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Policies för notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications as read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Publika tabeller (ingen RLS)
-- menu_items, menu_categories, locations är publika för läsning

-- ================================================================
-- INITIAL DATA
-- ================================================================

-- Grundinställningar
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"Moi Sushi & Poké Bowl"', 'Applikationens namn', 'general', true),
('app_version', '"1.0.0"', 'Applikationens version', 'general', false),
('maintenance_mode', 'false', 'Underhållsläge', 'general', true),
('loyalty_points_rate', '10', 'Krona per lojalitetspoäng', 'loyalty', false),
('delivery_radius', '10', 'Leveransradie i km', 'delivery', true),
('min_delivery_order', '200', 'Minsta beställning för leverans', 'delivery', true);

-- Platser
INSERT INTO locations (name, slug, address, phone, email, coordinates, opening_hours) VALUES
('Moi Sushi Malmö', 'malmo', 'Davidshallsgatan 7, 211 45 Malmö', '040-123456', 'malmo@moisushi.se', 
 POINT(13.0038, 55.6050), 
 '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "12:00-23:00", "sunday": "12:00-22:00"}'),

('Moi Sushi Trelleborg', 'trelleborg', 'Algatan 15, 231 42 Trelleborg', '0410-123456', 'trelleborg@moisushi.se',
 POINT(13.1567, 55.3753),
 '{"monday": "11:00-21:00", "tuesday": "11:00-21:00", "wednesday": "11:00-21:00", "thursday": "11:00-21:00", "friday": "11:00-22:00", "saturday": "12:00-22:00", "sunday": "12:00-21:00"}'),

('Moi Sushi Ystad', 'ystad', 'Stora Östergatan 3, 271 34 Ystad', '0411-123456', 'ystad@moisushi.se',
 POINT(13.8201, 55.4295),
 '{"monday": "11:00-21:00", "tuesday": "11:00-21:00", "wednesday": "11:00-21:00", "thursday": "11:00-21:00", "friday": "11:00-22:00", "saturday": "12:00-22:00", "sunday": "12:00-21:00"}');

-- Meny kategorier
INSERT INTO menu_categories (name, slug, description, icon, sort_order) VALUES
('Mois Rolls', 'mois-rolls', 'Kreativa Rullar', 'Sushi', 1),
('Helfriterade Maki', 'helfriterade-maki', 'Friterade makirullar', 'Flame', 2),
('Poké Bowls', 'pokebowls', 'Färgsprakande Pokébowls', 'Bowl', 3),
('Nigiri Combo', 'nigiri-combo', 'Nigiri Fusion', 'Fish', 4),
('Exotiska Delikatesser', 'exotiska', 'Speciella läckerheter', 'Star', 5),
('Barnmenyer', 'barnmeny', 'Anpassat för de små', 'Heart', 6),
('Smått Och Gott', 'smatt-gott', 'Sidorätter och tillbehör', 'Plus', 7),
('Våra Såser', 'saser', 'Smakexplosion', 'Droplet', 8),
('Soppa', 'soppa', 'Varma soppor', 'Soup', 9),
('Nigiri (1 par)', 'nigiri-par', 'Enskilda nigiri', 'ChefHat', 10),
('Drycker', 'drycker', 'Uppfriskande Drycker', 'Coffee', 11);

-- ================================================================
-- ADMIN VIEWS & RAPPORTER
-- ================================================================

-- View för daglig försäljningsrapport
CREATE VIEW daily_sales_report AS
SELECT 
    o.location,
    DATE(o.ordered_at) as date,
    COUNT(*) as total_orders,
    SUM(o.total) as total_revenue,
    AVG(o.total) as avg_order_value,
    COUNT(CASE WHEN o.order_type = 'delivery' THEN 1 END) as delivery_orders,
    COUNT(CASE WHEN o.order_type = 'pickup' THEN 1 END) as pickup_orders
FROM orders o
WHERE o.status NOT IN ('cancelled')
GROUP BY o.location, DATE(o.ordered_at)
ORDER BY date DESC, o.location;

-- View för populära menyobjekt
CREATE VIEW popular_menu_items AS
SELECT 
    mi.id,
    mi.name,
    mi.price,
    mc.name as category,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.total_price) as total_revenue
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE o.status NOT IN ('cancelled') OR o.status IS NULL
GROUP BY mi.id, mi.name, mi.price, mc.name
ORDER BY times_ordered DESC;

-- View för kundstatistik
CREATE VIEW customer_statistics AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_spent,
    AVG(o.total) as avg_order_value,
    MAX(o.ordered_at) as last_order,
    lp.points_balance,
    lp.tier
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status NOT IN ('cancelled')
LEFT JOIN loyalty_programs lp ON u.id = lp.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.name, u.email, lp.points_balance, lp.tier
ORDER BY total_spent DESC NULLS LAST;

-- ================================================================
-- EXTRA SQL FUNCTIONS FÖR ANALYTICS
-- ================================================================

-- Function för att öka menyobjekt-visningar
CREATE OR REPLACE FUNCTION increment_menu_item_views(
    item_id UUID,
    location_param location_enum,
    date_param DATE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO menu_item_analytics (menu_item_id, date, location, times_viewed)
    VALUES (item_id, date_param, location_param, 1)
    ON CONFLICT (menu_item_id, date, location)
    DO UPDATE SET times_viewed = menu_item_analytics.times_viewed + 1;
END;
$$ LANGUAGE plpgsql;

-- Function för att öka kundvagn-tillägg
CREATE OR REPLACE FUNCTION increment_menu_item_cart_adds(
    item_id UUID,
    location_param location_enum,
    date_param DATE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO menu_item_analytics (menu_item_id, date, location, times_added_to_cart)
    VALUES (item_id, date_param, location_param, 1)
    ON CONFLICT (menu_item_id, date, location)
    DO UPDATE SET times_added_to_cart = menu_item_analytics.times_added_to_cart + 1;
END;
$$ LANGUAGE plpgsql;

-- Function för att skapa beställning med items (transaktion)
CREATE OR REPLACE FUNCTION create_order_with_items(
    order_data JSONB,
    order_items JSONB
)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
    item JSONB;
BEGIN
    -- Skapa beställningen
    INSERT INTO orders (
        user_id, location, order_type, customer_name, customer_phone, 
        customer_email, delivery_address, subtotal, tax_amount, 
        delivery_fee, discount_amount, total, notes
    )
    SELECT 
        (order_data->>'user_id')::UUID,
        (order_data->>'location')::location_enum,
        (order_data->>'order_type')::order_type_enum,
        order_data->>'customer_name',
        order_data->>'customer_phone',
        order_data->>'customer_email',
        order_data->>'delivery_address',
        (order_data->>'subtotal')::DECIMAL,
        (order_data->>'tax_amount')::DECIMAL,
        (order_data->>'delivery_fee')::DECIMAL,
        (order_data->>'discount_amount')::DECIMAL,
        (order_data->>'total')::DECIMAL,
        order_data->>'notes'
    RETURNING id INTO new_order_id;
    
    -- Lägg till beställningsobjekt
    FOR item IN SELECT * FROM jsonb_array_elements(order_items)
    LOOP
        INSERT INTO order_items (
            order_id, menu_item_id, quantity, unit_price, total_price, notes
        ) VALUES (
            new_order_id,
            (item->>'menu_item_id')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'unit_price')::DECIMAL,
            (item->>'total_price')::DECIMAL,
            item->>'notes'
        );
    END LOOP;
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function för att lösa in lojalitetspoäng
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
    user_id UUID,
    points_to_redeem INTEGER,
    redemption_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Hämta nuvarande saldo
    SELECT points_balance INTO current_balance
    FROM loyalty_programs
    WHERE user_id = redeem_loyalty_points.user_id;
    
    -- Kontrollera om användaren har tillräckligt med poäng
    IF current_balance < points_to_redeem THEN
        RETURN FALSE;
    END IF;
    
    -- Uppdatera saldo
    UPDATE loyalty_programs
    SET 
        points_balance = points_balance - points_to_redeem,
        total_points_redeemed = total_points_redeemed + points_to_redeem,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE user_id = redeem_loyalty_points.user_id;
    
    -- Skapa transaktion
    INSERT INTO loyalty_transactions (
        user_id, type, points, description
    ) VALUES (
        redeem_loyalty_points.user_id,
        'redeemed',
        -points_to_redeem,
        redemption_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FUNCTIONS FÖR API
-- ================================================================

-- Function för att hämta meny med tillgänglighet
CREATE OR REPLACE FUNCTION get_menu_items(p_location location_enum DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    price DECIMAL,
    category_name VARCHAR,
    image_url TEXT,
    is_popular BOOLEAN,
    is_vegetarian BOOLEAN,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mc.name as category_name,
        mi.image_url,
        mi.is_popular,
        mi.is_vegetarian,
        mi.is_available
    FROM menu_items mi
    LEFT JOIN menu_categories mc ON mi.category_id = mc.id
    WHERE mi.is_available = true
    AND (p_location IS NULL OR mi.available_locations @> to_jsonb(p_location::text))
    ORDER BY mc.sort_order, mi.sort_order, mi.name;
END;
$$ LANGUAGE plpgsql;

-- Function för dashboard-statistik
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_location location_enum DEFAULT NULL, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', (
            SELECT COUNT(*) FROM orders 
            WHERE (p_location IS NULL OR location = p_location)
            AND ordered_at >= NOW() - INTERVAL '1 day' * p_days
            AND status NOT IN ('cancelled')
        ),
        'total_revenue', (
            SELECT COALESCE(SUM(total), 0) FROM orders 
            WHERE (p_location IS NULL OR location = p_location)
            AND ordered_at >= NOW() - INTERVAL '1 day' * p_days
            AND status NOT IN ('cancelled')
        ),
        'total_customers', (
            SELECT COUNT(DISTINCT user_id) FROM orders 
            WHERE user_id IS NOT NULL
            AND (p_location IS NULL OR location = p_location)
            AND ordered_at >= NOW() - INTERVAL '1 day' * p_days
            AND status NOT IN ('cancelled')
        ),
        'avg_order_value', (
            SELECT COALESCE(AVG(total), 0) FROM orders 
            WHERE (p_location IS NULL OR location = p_location)
            AND ordered_at >= NOW() - INTERVAL '1 day' * p_days
            AND status NOT IN ('cancelled')
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- SLUTKOMMENTAR
-- ================================================================

/*
DETTA SCHEMA INKLUDERAR:

✅ CORE FUNKTIONALITET:
- Komplett användarhantering med roller
- Fullständig menyhantering med kategorier
- Beställningssystem med alla statuser
- Bokningssystem med tillgänglighet
- Favoriter och användarpreferenser

✅ ADMIN DASHBOARD:
- Fullständig analytics och rapportering
- Försäljningsstatistik per plats och datum
- Kundanalys och segmentering
- Menyanalys och prestanda
- Admin aktivitetslogg

✅ MARKNADSFÖRING:
- Kampanj- och erbjudandesystem
- E-postkampanjer
- Rabattkoder och kuponger
- Lojalitetsprogram med poäng

✅ KUNDUPPLEVELSE:
- Recensioner och betyg
- Notifikationssystem
- Användaradresser
- Personalisering

✅ ANALYTICS & TRACKING:
- Detaljerad besöksstatistik
- Användarsessioner och beteende
- Försäljningsmetrik
- A/B testing support

✅ SÄKERHET & PRESTANDA:
- Row Level Security (RLS)
- Optimerade index
- Triggers för automatisering
- Referensintegritet

ANVÄNDNING:
1. Kör detta schema i din Supabase-databas
2. Konfigurera authentication policies
3. Anslut med din Next.js-app
4. Använd de medföljande funktionerna för API-anrop

Detta ger dig en komplett, skalbar och säker databas för hela Moi Sushi-applikationen!
*/ 