-- Fix RLS policies for bookings table
-- This allows admin users to read, update and delete all bookings

-- Allow admin users to read all bookings
CREATE POLICY "admin_read_all_bookings" ON bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admin users to update all bookings
CREATE POLICY "admin_update_all_bookings" ON bookings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admin users to delete all bookings
CREATE POLICY "admin_delete_all_bookings" ON bookings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow users to read their own bookings (optional)
CREATE POLICY "users_read_own_bookings" ON bookings
    FOR SELECT
    USING (auth.uid() = user_id); 