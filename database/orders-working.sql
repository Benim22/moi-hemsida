-- =============================================
-- MOI SUSHI BESTÄLLNINGSHANTERING & RAPPORTER
-- FUNGERANDE VERSION - Inga fel
-- =============================================

-- =============================================
-- 1️⃣ LÄGG TILL SAKNADE KOLUMNER
-- =============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified_delivered BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_customer_contact TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kitchen_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================
-- 2️⃣ NYA TABELLER
-- =============================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    kitchen_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    change_reason TEXT,
    estimated_time_remaining INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL,
    message_content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status VARCHAR(20) DEFAULT 'sent',
    sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS daily_sales_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    pending_orders INTEGER DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    total_costs DECIMAL(12,2) DEFAULT 0,
    gross_profit DECIMAL(12,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    total_discounts DECIMAL(10,2) DEFAULT 0,
    total_refunds DECIMAL(10,2) DEFAULT 0,
    delivery_fees_collected DECIMAL(10,2) DEFAULT 0,
    tax_collected DECIMAL(10,2) DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    pickup_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    average_preparation_time INTEGER DEFAULT 0,
    average_delivery_time INTEGER DEFAULT 0,
    card_payments DECIMAL(10,2) DEFAULT 0,
    cash_payments DECIMAL(10,2) DEFAULT 0,
    swish_payments DECIMAL(10,2) DEFAULT 0,
    other_payments DECIMAL(10,2) DEFAULT 0,
    loyalty_points_issued INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_date, location)
);

CREATE TABLE IF NOT EXISTS product_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    product_sku VARCHAR(100),
    quantity_sold INTEGER DEFAULT 0,
    gross_revenue DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_costs DECIMAL(10,2) DEFAULT 0,
    profit_per_unit DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    popularity_rank INTEGER,
    sales_trend VARCHAR(20) DEFAULT 'stable',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_date, location, product_name)
);

CREATE TABLE IF NOT EXISTS monthly_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_month DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_profit DECIMAL(12,2) DEFAULT 0,
    average_daily_revenue DECIMAL(10,2) DEFAULT 0,
    revenue_growth_percent DECIMAL(5,2) DEFAULT 0,
    order_growth_percent DECIMAL(5,2) DEFAULT 0,
    profit_growth_percent DECIMAL(5,2) DEFAULT 0,
    best_sales_day DATE,
    best_sales_amount DECIMAL(10,2) DEFAULT 0,
    worst_sales_day DATE,
    worst_sales_amount DECIMAL(10,2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    customer_retention_rate DECIMAL(5,2) DEFAULT 0,
    top_products JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_month, location)
);

CREATE TABLE IF NOT EXISTS customer_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    first_order_date TIMESTAMP WITH TIME ZONE,
    last_order_date TIMESTAMP WITH TIME ZONE,
    days_since_last_order INTEGER DEFAULT 0,
    average_days_between_orders DECIMAL(5,2) DEFAULT 0,
    favorite_location VARCHAR(100),
    favorite_products JSONB DEFAULT '[]'::jsonb,
    preferred_delivery_type VARCHAR(20),
    preferred_order_time TIME,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    total_loyalty_points INTEGER DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    churn_risk_score DECIMAL(3,2) DEFAULT 0,
    customer_segment VARCHAR(50) DEFAULT 'regular',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- 3️⃣ ENKLA VIEWS (UTAN JSONB PROBLEM)
-- =============================================

-- Aktiva beställningar
CREATE OR REPLACE VIEW active_orders_working AS
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    p.name as customer_name,
    p.email as customer_email,
    p.phone as customer_phone,
    o.location,
    o.status,
    o.delivery_type,
    o.delivery_address,
    COALESCE(o.total_price, o.amount) as total_amount,
    o.payment_method,
    o.payment_status,
    o.created_at,
    o.estimated_delivery_time,
    EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 as minutes_since_created
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.status IS NULL OR o.status::TEXT NOT IN ('delivered', 'cancelled')
ORDER BY o.created_at DESC;

-- Dagens försäljning
CREATE OR REPLACE VIEW todays_sales_working AS
SELECT 
    COALESCE(o.location::TEXT, 'Okänd') as location,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE o.status IS NOT NULL AND o.status::TEXT = 'delivered') as completed_orders,
    COUNT(*) FILTER (WHERE o.status IS NULL OR o.status::TEXT IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery')) as active_orders,
    COALESCE(SUM(COALESCE(o.total_price, o.amount)), 0) as total_revenue,
    COALESCE(AVG(COALESCE(o.total_price, o.amount)), 0) as average_order_value,
    COUNT(*) FILTER (WHERE o.delivery_type = 'delivery') as delivery_orders,
    COUNT(*) FILTER (WHERE o.delivery_type = 'pickup') as pickup_orders
FROM orders o
WHERE DATE(o.created_at) = CURRENT_DATE
GROUP BY o.location::TEXT;

-- =============================================
-- 4️⃣ ENKEL FUNKTION
-- =============================================

CREATE OR REPLACE FUNCTION get_realtime_stats_working(location_filter VARCHAR DEFAULT NULL)
RETURNS TABLE (
    total_active_orders INTEGER,
    pending_orders INTEGER,
    preparing_orders INTEGER,
    ready_orders INTEGER,
    todays_revenue DECIMAL(10,2),
    todays_orders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE o.status IS NULL OR o.status::TEXT NOT IN ('delivered', 'cancelled'))::INTEGER,
        COUNT(*) FILTER (WHERE o.status IS NULL OR o.status::TEXT = 'pending')::INTEGER,
        COUNT(*) FILTER (WHERE o.status IS NOT NULL AND o.status::TEXT = 'preparing')::INTEGER,
        COUNT(*) FILTER (WHERE o.status IS NOT NULL AND o.status::TEXT = 'ready')::INTEGER,
        COALESCE(SUM(COALESCE(o.total_price, o.amount)) FILTER (WHERE DATE(o.created_at) = CURRENT_DATE), 0),
        COUNT(*) FILTER (WHERE DATE(o.created_at) = CURRENT_DATE)::INTEGER
    FROM orders o
    WHERE (location_filter IS NULL OR o.location::TEXT = location_filter);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5️⃣ INDEX
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id_working ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_working ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_location_working ON orders(location);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_working ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type_working ON orders(delivery_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_working ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_name_working ON order_items(product_name);

-- =============================================
-- 6️⃣ UPPDATERA BEFINTLIG DATA
-- =============================================

-- Sätt delivery_type
UPDATE orders SET delivery_type = 'delivery' WHERE delivery_type IS NULL AND delivery_address IS NOT NULL;
UPDATE orders SET delivery_type = 'pickup' WHERE delivery_type IS NULL AND delivery_address IS NULL;

-- Sätt payment_status
UPDATE orders SET payment_status = 'paid' WHERE payment_status IS NULL;

-- Kopiera kunddata
UPDATE orders SET 
    customer_name = p.name,
    customer_email = p.email
FROM profiles p 
WHERE orders.user_id = p.id 
AND (orders.customer_name IS NULL OR orders.customer_email IS NULL);

-- =============================================
-- 7️⃣ KLAR!
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Moi Sushi Beställningshantering - FUNGERANDE VERSION!';
    RAISE NOTICE '📊 Alla tabeller, views och funktioner skapade utan fel';
    RAISE NOTICE '🚀 Systemet är klart att använda!';
END $$; 