-- Lägg till menykategorier
INSERT INTO menu_categories (name, slug, description, icon, sort_order, is_active) VALUES
('Mois Rolls', 'mois-rolls', 'Kreativa Rullar', 'Sushi', 1, true),
('Helfriterade Maki', 'helfriterade-maki', 'Friterade makirullar', 'Flame', 2, true),
('Poké Bowls', 'pokebowls', 'Färgsprakande Pokébowls', 'Bowl', 3, true),
('Nigiri Combo', 'nigiri-combo', 'Nigiri Fusion', 'Fish', 4, true),
('Exotiska Delikatesser', 'exotiska', 'Speciella läckerheter', 'Star', 5, true),
('Barnmenyer', 'barnmeny', 'Anpassat för de små', 'Heart', 6, true),
('Smått Och Gott', 'smatt-gott', 'Sidorätter och tillbehör', 'Plus', 7, true),
('Våra Såser', 'saser', 'Smakexplosion', 'Droplet', 8, true),
('Soppa', 'soppa', 'Varma soppor', 'Soup', 9, true),
('Nigiri (1 par)', 'nigiri-par', 'Enskilda nigiri', 'ChefHat', 10, true),
('Drycker', 'drycker', 'Uppfriskande Drycker', 'Coffee', 11, true);

-- Lägg till menyobjekt för Mois Rolls
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'california-roll',
  'California Roll',
  'En klassisk rulle där krispig gurka, krämig avokado och en lätt söt calimix kombineras för att skapa en fräsch och välbalanserad smakupplevelse som lockar både öga och gom.',
  109,
  '/menu-images/california roll.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  true,
  true,
  ARRAY['Gurka', 'Avokado', 'Calimix'],
  ARRAY['Fisk', 'Ägg'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 280, "protein": 8, "carbs": 35, "fat": 12}'::jsonb
),
(
  'salmon-roll',
  'Salmon Roll',
  'Färskost, avokado, gurka och delikat lax möts i denna rulle som erbjuder en harmonisk blandning av mjuka och friska smaker – en riktig klassiker med en modern twist.',
  115,
  '/menu-images/salmon roll.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  true,
  true,
  ARRAY['Färskost', 'Avokado', 'Gurka', 'Lax'],
  ARRAY['Fisk', 'Mjölk'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 320, "protein": 15, "carbs": 28, "fat": 18}'::jsonb
),
(
  'shrimp-roll',
  'Shrimp Roll',
  'En smakrik rulle fylld med färskost, avokado, gurka, sockerärta och saftiga räkor. Varje tugga ger en härlig mix av krispighet och lenhet, perfekt för den äventyrlige.',
  129,
  '/menu-images/shrimp roll.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  false,
  true,
  ARRAY['Färskost', 'Avokado', 'Gurka', 'Sockerärta', 'Räka'],
  ARRAY['Skaldjur', 'Mjölk'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 295, "protein": 18, "carbs": 25, "fat": 15}'::jsonb
),
(
  'veggo-roll',
  'Veggo Roll',
  'En grönare variant med gurka, färskost, avokado, tofu och inari. Denna rulle är speciellt framtagen för dig som vill ha ett vegetariskt alternativ utan att kompromissa med smak och fräschhet.',
  109,
  '/menu-images/veggo roll.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  false,
  true,
  ARRAY['Gurka', 'Färskost', 'Avokado', 'Tofu', 'Inari'],
  ARRAY['Soja', 'Mjölk'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 260, "protein": 12, "carbs": 30, "fat": 10}'::jsonb
),
(
  'vegan-roll',
  'Vegan Roll',  
  'Helt växtbaserad med gurka, avokado, sockerärtor, tofu och inari. En lätt och smakfull rulle som visar att veganskt kan vara både kreativt och utsökt, med en naturlig balans mellan smaker.',
  109,
  '/menu-images/vegan roll.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  false,
  true,
  ARRAY['Gurka', 'Avokado', 'Sockerärtor', 'Tofu', 'Inari'],
  ARRAY['Soja'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 240, "protein": 10, "carbs": 28, "fat": 8}'::jsonb
),
(
  'crazy-salmon',
  'Crazy Salmon',
  'En rulle med en oväntad twist: krispig textur från sockerärta och avokado, blandat med färskost och toppad med en flamberad laxröra. En spännande kombination som utmanar de traditionella sushismakerna.',
  135,
  '/menu-images/crazy salmon.png',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  true,
  true,
  ARRAY['Sockerärta', 'Avokado', 'Färskost', 'Flamberad lax'],
  ARRAY['Fisk', 'Mjölk'],
  1,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 350, "protein": 20, "carbs": 25, "fat": 22}'::jsonb
),
(
  'crazy-shrimp',
  'Crazy Shrimp',
  'Här möts krispighet och tradition – en rulle med avokado, sockerärta och färskost som avslutas med en flamberad räkröra. En djärv och smakrik kreation som garanterat överraskar.',
  135,
  '/menu-images/crazy shrimp.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'mois-rolls'),
  false,
  true,
  ARRAY['Avokado', 'Sockerärta', 'Färskost', 'Flamberad räka'],
  ARRAY['Skaldjur', 'Mjölk'],
  1,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 330, "protein": 22, "carbs": 22, "fat": 20}'::jsonb
);

-- Lägg till Helfriterade Maki
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'uramaki-salmon',
  'Uramaki Lax',
  'Helfriterad rulle med lax, avokado och gurka. Serveras med spicy mayo och teriyaki. En krispig utsida med mjuk insida.',
  149,
  '/menu-images/uramaki-salmon.jpg',  
  (SELECT id FROM menu_categories WHERE slug = 'helfriterade-maki'),
  true,
  true,
  ARRAY['Lax', 'Avokado', 'Gurka', 'Spicy mayo', 'Teriyaki'],
  ARRAY['Fisk', 'Ägg', 'Soja'],
  2,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 420, "protein": 25, "carbs": 35, "fat": 25}'::jsonb
),
(
  'uramaki-tuna',
  'Uramaki Tonfisk',
  'Friterad rulle med tonfisk, avokado och sockerärta. Toppas med sriracha mayo och sesam.',
  159,
  '/menu-images/uramaki-tuna.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'helfriterade-maki'),
  false,
  true,
  ARRAY['Tonfisk', 'Avokado', 'Sockerärta', 'Sriracha mayo', 'Sesam'],
  ARRAY['Fisk', 'Ägg', 'Sesam'],
  3,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 450, "protein": 28, "carbs": 32, "fat": 28}'::jsonb
);

-- Lägg till Poké Bowls
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'salmon-poke-bowl',
  'Lax Poké Bowl',
  'Färsk lax på bädd av sushiris med avokado, gurka, edamame, wakame och sesam. Serveras med ponzu dressing.',
  179,
  '/menu-images/salmon-poke.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'pokebowls'),
  true,
  true,
  ARRAY['Lax', 'Sushiris', 'Avokado', 'Gurka', 'Edamame', 'Wakame', 'Sesam', 'Ponzu'],
  ARRAY['Fisk', 'Soja', 'Sesam'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 520, "protein": 35, "carbs": 45, "fat": 22}'::jsonb
),
(
  'tuna-poke-bowl',
  'Tonfisk Poké Bowl',
  'Sesampanerad tonfisk med sushiris, mango, avokado, rödkål och cashewnötter. Serveras med teriyaki dressing.',
  189,
  '/menu-images/tuna-poke.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'pokebowls'),
  true,
  true,
  ARRAY['Tonfisk', 'Sesam', 'Sushiris', 'Mango', 'Avokado', 'Rödkål', 'Cashewnötter', 'Teriyaki'],
  ARRAY['Fisk', 'Sesam', 'Nötter', 'Soja'],
  1,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 580, "protein": 38, "carbs": 48, "fat": 28}'::jsonb
),
(
  'veggie-poke-bowl',
  'Vegetarisk Poké Bowl',
  'Marinerad tofu med quinoa, avokado, gurka, morötter, rödkål och pumpakärnor. Serveras med tahini dressing.',
  169,
  '/menu-images/veggie-poke.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'pokebowls'),
  false,
  true,
  ARRAY['Tofu', 'Quinoa', 'Avokado', 'Gurka', 'Morötter', 'Rödkål', 'Pumpakärnor', 'Tahini'],
  ARRAY['Soja', 'Sesam'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 480, "protein": 20, "carbs": 52, "fat": 24}'::jsonb
);

-- Lägg till Nigiri Combo
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'nigiri-combo-deluxe',
  'Nigiri Combo Deluxe',
  '10 bitar nigiri: lax, tonfisk, räka, ål, makrill. Serveras med wasabi, ingefära och sojasås.',
  299,
  '/menu-images/nigiri-combo-deluxe.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'nigiri-combo'),
  true,
  true,
  ARRAY['Lax', 'Tonfisk', 'Räka', 'Ål', 'Makrill', 'Sushiris', 'Wasabi', 'Ingefära'],
  ARRAY['Fisk', 'Skaldjur', 'Soja'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 680, "protein": 55, "carbs": 65, "fat": 18}'::jsonb
),
(
  'nigiri-combo-classic',
  'Nigiri Combo Classic',
  '8 bitar nigiri: lax, tonfisk, räka, ål. Perfekt för nybörjare.',
  249,
  '/menu-images/nigiri-combo-classic.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'nigiri-combo'),
  false,
  true,
  ARRAY['Lax', 'Tonfisk', 'Räka', 'Ål', 'Sushiris'],
  ARRAY['Fisk', 'Skaldjur'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 520, "protein": 42, "carbs": 48, "fat": 14}'::jsonb
);

-- Lägg till drycker
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'coca-cola',
  'Coca-Cola 33cl',
  'Klassisk Coca-Cola',
  25,
  '/menu-images/coca-cola.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'drycker'),
  true,
  true,
  ARRAY['Kolsyrat vatten', 'Socker', 'Koffein'],
  ARRAY[],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 140, "protein": 0, "carbs": 39, "fat": 0}'::jsonb
),
(
  'ramune-original',
  'Ramune Original',
  'Japansk läskedryck med unik glaskuldesign',
  39,
  '/menu-images/ramune.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'drycker'),
  true,
  true,
  ARRAY['Kolsyrat vatten', 'Socker', 'Citronarom'],
  ARRAY[],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 120, "protein": 0, "carbs": 32, "fat": 0}'::jsonb
),
(
  'green-tea',
  'Grönt Te',
  'Traditionellt japanskt grönt te',
  29,
  '/menu-images/green-tea.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'drycker'),
  false,
  true,
  ARRAY['Grönt te', 'Vatten'],
  ARRAY[],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 2, "protein": 0, "carbs": 0, "fat": 0}'::jsonb
);

-- Lägg till såser
INSERT INTO menu_items (
  id, name, description, price, image_url, category_id, is_popular, 
  is_available, ingredients, allergens, spicy_level, 
  locations_available, nutritional_info
) VALUES 
(
  'spicy-mayo',
  'Spicy Mayo',
  'Krämig mayo med sriracha',
  15,
  '/menu-images/spicy-mayo.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'saser'),
  true,
  true,
  ARRAY['Majonnäs', 'Sriracha', 'Vitlök'],
  ARRAY['Ägg'],
  2,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 90, "protein": 1, "carbs": 2, "fat": 9}'::jsonb
),
(
  'teriyaki-sauce',
  'Teriyaki Sås',
  'Söt och salt japansk sås',
  15,
  '/menu-images/teriyaki.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'saser'),
  true,
  true,
  ARRAY['Sojasås', 'Mirin', 'Socker', 'Ingefära'],
  ARRAY['Soja'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 35, "protein": 1, "carbs": 8, "fat": 0}'::jsonb
),
(
  'ponzu-sauce',
  'Ponzu Sås',
  'Citrusbaserad sojasås',
  18,
  '/menu-images/ponzu.jpg',
  (SELECT id FROM menu_categories WHERE slug = 'saser'),
  false,
  true,
  ARRAY['Sojasås', 'Citrus', 'Mirin', 'Kombu'],
  ARRAY['Soja'],
  0,
  ARRAY['malmo'::location_enum, 'trelleborg'::location_enum, 'ystad'::location_enum],
  '{"calories": 15, "protein": 1, "carbs": 3, "fat": 0}'::jsonb
);

-- Lägg till testanvändare (lösenord: test123)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test@moisushi.se',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Lägg till admin användare (lösenord: admin123)  
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@moisushi.se',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Lägg till test orders
INSERT INTO orders (
  id, customer_name, customer_email, customer_phone, location, 
  total_amount, status, delivery_address, notes
) VALUES 
(
  'order-001',
  'Anna Andersson',
  'anna@test.se',
  '0701234567',
  'malmo',
  234,
  'completed',
  'Testgatan 1, 211 11 Malmö',
  'Ring när ni är framme'
),
(
  'order-002', 
  'Erik Eriksson',
  'erik@test.se',
  '0709876543',
  'trelleborg',
  189,
  'pending',
  'Storgatan 5, 231 30 Trelleborg',
  NULL
);

-- Lägg till order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price, total) VALUES
('order-001', 'california-roll', 1, 109, 109),
('order-001', 'salmon-roll', 1, 115, 115),
('order-001', 'spicy-mayo', 2, 15, 30);

INSERT INTO order_items (order_id, menu_item_id, quantity, price, total) VALUES
('order-002', 'salmon-poke-bowl', 1, 179, 179),
('order-002', 'spicy-mayo', 1, 15, 15);

-- Lägg till test bookings
INSERT INTO bookings (
  id, customer_name, customer_email, customer_phone, location,
  date, time, party_size, status, special_requests
) VALUES
(
  'booking-001',
  'Maria Månsson',
  'maria@test.se', 
  '0731234567',
  'ystad',
  '2024-12-25',
  '18:00',
  4,
  'confirmed',
  'Glutenfritt alternativ önskas'
),
(
  'booking-002',
  'Johan Johansson',
  'johan@test.se',
  '0709999888',
  'malmo', 
  '2024-12-26',
  '19:30',
  2,
  'confirmed',
  NULL
);

-- Lägg till några sample analytics data
INSERT INTO page_visits (page_path, location, visit_duration) VALUES
('/menu', 'malmo', 120),
('/menu/mois-rolls', 'malmo', 85),
('/booking', 'trelleborg', 95),
('/admin/dashboard', 'malmo', 300);

INSERT INTO sales_metrics (date, location, total_revenue, order_count, avg_order_value) VALUES
('2024-12-20', 'malmo', 2340, 12, 195),
('2024-12-20', 'trelleborg', 1890, 8, 236),
('2024-12-20', 'ystad', 1560, 7, 223),
('2024-12-19', 'malmo', 2100, 10, 210),
('2024-12-19', 'trelleborg', 2200, 9, 244),
('2024-12-19', 'ystad', 1800, 8, 225); 