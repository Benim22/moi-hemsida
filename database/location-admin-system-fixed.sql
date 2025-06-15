-- Location-based Admin Notification System (Fixed Version)
-- This system ensures that orders are only sent to admins responsible for specific locations

-- Create admin_locations table to map admins to their responsible locations
CREATE TABLE IF NOT EXISTS admin_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_id location_type NOT NULL, -- Use existing enum: 'trelleborg', 'ystad', 'malmo'
    is_primary BOOLEAN DEFAULT false, -- Primary admin for this location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique admin-location combinations
    UNIQUE(admin_id, location_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_locations_admin_id ON admin_locations(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_locations_location_id ON admin_locations(location_id);

-- Add location_id to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_id location_type;

-- Create function to get admins for a specific location
CREATE OR REPLACE FUNCTION get_location_admins(location_name location_type)
RETURNS TABLE(admin_id UUID, email TEXT, is_primary BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.admin_id,
        au.email,
        al.is_primary
    FROM admin_locations al
    JOIN auth.users au ON al.admin_id = au.id
    WHERE al.location_id = location_name
    ORDER BY al.is_primary DESC, al.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin for specific location
CREATE OR REPLACE FUNCTION is_location_admin(user_id UUID, location_name location_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_locations 
        WHERE admin_id = user_id AND location_id = location_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_locations_updated_at
    BEFORE UPDATE ON admin_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_locations_updated_at();

-- Create RLS policies for admin_locations table
ALTER TABLE admin_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view their own location assignments
CREATE POLICY "Admins can view own locations" ON admin_locations
    FOR SELECT
    USING (admin_id = auth.uid());

-- Policy: Super admins can manage all location assignments
CREATE POLICY "Super admins can manage all locations" ON admin_locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create view for location admin summary
CREATE OR REPLACE VIEW location_admin_summary AS
SELECT 
    al.location_id,
    COUNT(*) as admin_count,
    COUNT(*) FILTER (WHERE al.is_primary) as primary_admin_count,
    array_agg(
        json_build_object(
            'admin_id', al.admin_id,
            'email', au.email,
            'is_primary', al.is_primary,
            'created_at', al.created_at
        ) ORDER BY al.is_primary DESC, al.created_at ASC
    ) as admins
FROM admin_locations al
JOIN auth.users au ON al.admin_id = au.id
GROUP BY al.location_id;

-- Grant necessary permissions
GRANT SELECT ON location_admin_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_location_admins(location_type) TO authenticated;
GRANT EXECUTE ON FUNCTION is_location_admin(UUID, location_type) TO authenticated;

-- Create notification preferences table for location-specific settings
CREATE TABLE IF NOT EXISTS location_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id location_type NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    notification_delay_minutes INTEGER DEFAULT 0, -- Delay before sending notifications
    auto_assign_orders BOOLEAN DEFAULT true, -- Automatically assign orders to primary admin
    backup_notification_minutes INTEGER DEFAULT 15, -- Send to backup admins if no response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default notification preferences for each location
INSERT INTO location_notification_preferences (location_id) VALUES
('trelleborg'::location_type),
('ystad'::location_type),
('malmo'::location_type)
ON CONFLICT (location_id) DO NOTHING;

-- Create trigger for notification preferences updated_at
CREATE TRIGGER trigger_update_location_notification_preferences_updated_at
    BEFORE UPDATE ON location_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_locations_updated_at();

-- Enable RLS for notification preferences
ALTER TABLE location_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Location admins can view and update their location's notification preferences
CREATE POLICY "Location admins can manage notification preferences" ON location_notification_preferences
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_locations 
            WHERE admin_id = auth.uid() 
            AND location_id = location_notification_preferences.location_id
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create function to get notification preferences for a location
CREATE OR REPLACE FUNCTION get_location_notification_preferences(location_name location_type)
RETURNS TABLE(
    email_notifications BOOLEAN,
    sms_notifications BOOLEAN,
    push_notifications BOOLEAN,
    notification_delay_minutes INTEGER,
    auto_assign_orders BOOLEAN,
    backup_notification_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lnp.email_notifications,
        lnp.sms_notifications,
        lnp.push_notifications,
        lnp.notification_delay_minutes,
        lnp.auto_assign_orders,
        lnp.backup_notification_minutes
    FROM location_notification_preferences lnp
    WHERE lnp.location_id = location_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_location_notification_preferences(location_type) TO authenticated;

-- Create order assignment tracking table
CREATE TABLE IF NOT EXISTS order_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_id location_type NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'completed', 'transferred')),
    notes TEXT,
    
    UNIQUE(order_id) -- Each order can only be assigned to one admin at a time
);

-- Create indexes for order assignments
CREATE INDEX IF NOT EXISTS idx_order_assignments_order_id ON order_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_admin_id ON order_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_location_id ON order_assignments(location_id);

-- Enable RLS for order assignments
ALTER TABLE order_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view assignments for their locations
CREATE POLICY "Admins can view location assignments" ON order_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_locations 
            WHERE admin_id = auth.uid() 
            AND location_id = order_assignments.location_id
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy: Admins can update their own assignments
CREATE POLICY "Admins can update own assignments" ON order_assignments
    FOR UPDATE
    USING (admin_id = auth.uid());

-- Create function to auto-assign order to location admin
CREATE OR REPLACE FUNCTION auto_assign_order_to_location(order_uuid UUID, location_name location_type)
RETURNS UUID AS $$
DECLARE
    primary_admin_id UUID;
    assigned_admin_id UUID;
BEGIN
    -- First try to get primary admin for the location
    SELECT admin_id INTO primary_admin_id
    FROM admin_locations
    WHERE location_id = location_name AND is_primary = true
    LIMIT 1;
    
    -- If no primary admin, get any admin for the location
    IF primary_admin_id IS NULL THEN
        SELECT admin_id INTO primary_admin_id
        FROM admin_locations
        WHERE location_id = location_name
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;
    
    -- If we found an admin, assign the order
    IF primary_admin_id IS NOT NULL THEN
        INSERT INTO order_assignments (order_id, admin_id, location_id)
        VALUES (order_uuid, primary_admin_id, location_name)
        ON CONFLICT (order_id) DO UPDATE SET
            admin_id = EXCLUDED.admin_id,
            location_id = EXCLUDED.location_id,
            assigned_at = NOW(),
            status = 'assigned';
        
        assigned_admin_id := primary_admin_id;
    END IF;
    
    RETURN assigned_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION auto_assign_order_to_location(UUID, location_type) TO authenticated;

-- Create trigger to auto-assign orders when they are created with a location
CREATE OR REPLACE FUNCTION trigger_auto_assign_order()
RETURNS TRIGGER AS $$
DECLARE
    preferences RECORD;
BEGIN
    -- Only auto-assign if location_id is provided and auto_assign_orders is enabled
    IF NEW.location_id IS NOT NULL THEN
        SELECT * INTO preferences
        FROM location_notification_preferences
        WHERE location_id = NEW.location_id;
        
        IF preferences.auto_assign_orders THEN
            PERFORM auto_assign_order_to_location(NEW.id, NEW.location_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_new_orders
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_assign_order();

-- Create view for order assignments with admin details
CREATE OR REPLACE VIEW order_assignments_detailed AS
SELECT 
    oa.id,
    oa.order_id,
    oa.admin_id,
    oa.location_id,
    oa.assigned_at,
    oa.status,
    oa.notes,
    au.email as admin_email,
    p.name as admin_name,
    o.total_price,
    o.status as order_status,
    o.created_at as order_created_at
FROM order_assignments oa
JOIN auth.users au ON oa.admin_id = au.id
LEFT JOIN profiles p ON oa.admin_id = p.id
JOIN orders o ON oa.order_id = o.id;

GRANT SELECT ON order_assignments_detailed TO authenticated;

-- Add helpful comments
COMMENT ON TABLE admin_locations IS 'Maps administrators to the restaurant locations they are responsible for';
COMMENT ON TABLE location_notification_preferences IS 'Notification settings for each restaurant location';
COMMENT ON TABLE order_assignments IS 'Tracks which admin is assigned to handle each order';
COMMENT ON FUNCTION get_location_admins(location_type) IS 'Returns all admins responsible for a specific location';
COMMENT ON FUNCTION is_location_admin(UUID, location_type) IS 'Checks if a user is an admin for a specific location';
COMMENT ON FUNCTION auto_assign_order_to_location(UUID, location_type) IS 'Automatically assigns an order to the primary admin of a location'; 