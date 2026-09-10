-- Halls
CREATE TABLE halls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    capacity INTEGER,
    price_per_day DECIMAL(10,2),
    description TEXT
);

-- Menu Packages
CREATE TABLE menu_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    cuisine_type VARCHAR(50), -- 'desi', 'continental', 'bbq'
    price_per_head DECIMAL(10,2),
    items JSONB, -- ['Chicken Karahi', 'Biryani', 'Naan']
    min_guests INTEGER,
    max_guests INTEGER,
    is_vegetarian BOOLEAN DEFAULT false
);

-- Bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    event_date DATE,
    hall_id INTEGER REFERENCES halls(id),
    expected_guests INTEGER,
    actual_guests INTEGER,
    menu_package_id INTEGER REFERENCES menu_packages(id),
    total_budget DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Chat History (so the assistant remembers context)
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid(),
    messages JSONB DEFAULT '[]', -- [{role: 'user', content: '...'}, ...]
    booking_data JSONB DEFAULT '{}', -- extracted intent: {guests: 200, date: '...'}
    created_at TIMESTAMP DEFAULT NOW()
);

-- -- Insert sample data
-- INSERT INTO halls (name, capacity, price_per_day, description) VALUES
-- ('Royal Hall', 300, 80000, 'Grand hall with stage and lighting'),
-- ('Crystal Hall', 150, 45000, 'Intimate setting for medium gatherings');

-- INSERT INTO menu_packages (name, cuisine_type, price_per_head, items, min_guests, max_guests, is_vegetarian) VALUES
-- ('Gold Desi', 'desi', 1200, '["Chicken Karahi", "Mutton Biryani", "Naan", "Raita", "Kheer"]', 100, 500, false),
-- ('Silver Desi', 'desi', 800, '["Chicken Qorma", "Pulao", "Naan", "Salad", "Gulab Jamun"]', 50, 300, false),
-- ('Veg Deluxe', 'desi', 700, '["Palak Paneer", "Dal Makhani", "Jeera Rice", "Naan", "Ras Malai"]', 50, 300, true);