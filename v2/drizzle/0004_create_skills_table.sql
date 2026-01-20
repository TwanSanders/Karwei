-- Create skills table
CREATE TABLE IF NOT EXISTS karwei.skill (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    icon TEXT,
    display_order INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert initial 15 skills
INSERT INTO karwei.skill (name, category, display_order) VALUES
('Electronics', 'Technical', 1),
('Woodwork', 'Crafts', 2),
('Textile', 'Crafts', 3),
('Metalwork', 'Technical', 4),
('Appliances', 'Technical', 5),
('Plumbing', 'Home', 6),
('Electrical', 'Technical', 7),
('Bicycle Repair', 'Transport', 8),
('Automotive', 'Transport', 9),
('Jewelry', 'Crafts', 10),
('Leather', 'Crafts', 11),
('Musical Instruments', 'Arts', 12),
('Ceramics & Glass', 'Crafts', 13),
('Gardening Tools', 'Home', 14),
('General Handyman', 'General', 15);
