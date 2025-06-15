-- Test address functionality
-- Test updating a profile with address
UPDATE profiles 
SET address = 'Testgatan 123, 123 45 Teststad'
WHERE email = 'test@example.com';

-- Test creating an order with delivery
INSERT INTO orders (
  user_id,
  items,
  total_price,
  amount,
  location,
  delivery_type,
  delivery_address,
  phone,
  notes,
  payment_method,
  order_number
) VALUES (
  (SELECT id FROM profiles WHERE email = 'test@example.com' LIMIT 1),
  '[{"id": 1, "name": "Test Sushi", "price": 150, "quantity": 2}]'::jsonb,
  300,
  300,
  'trelleborg',
  'delivery',
  'Testgatan 123, 123 45 Teststad',
  '070-123 45 67',
  'Leveranstid: Om 1 timme | Leveransadress: Testgatan 123, 123 45 Teststad',
  'cash',
  '123456'
);

-- Test query to get orders with delivery info
SELECT 
  o.id,
  o.order_number,
  o.delivery_type,
  o.delivery_address,
  o.total_price,
  p.name as customer_name,
  p.email as customer_email,
  p.address as profile_address
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE o.delivery_type = 'delivery'
ORDER BY o.created_at DESC
LIMIT 5; 