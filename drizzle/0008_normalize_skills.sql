-- Create junction table for many-to-many user-skills relationship
CREATE TABLE IF NOT EXISTS karwei.users_to_skills (
    user_id TEXT NOT NULL REFERENCES karwei."user"(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES karwei.skill(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS users_to_skills_user_id_idx ON karwei.users_to_skills(user_id);
CREATE INDEX IF NOT EXISTS users_to_skills_skill_id_idx ON karwei.users_to_skills(skill_id);

-- Populate skills table with icons (update existing or insert new)
INSERT INTO karwei.skill (name, icon, display_order, active)
VALUES 
    ('Electronics', '🔌', 1, true),
    ('Woodwork', '🪵', 2, true),
    ('Textile', '🧵', 3, true),
    ('Metalwork', '🔩', 4, true),
    ('Appliances', '🔧', 5, true),
    ('Plumbing', '🚰', 6, true),
    ('Electrical', '⚡', 7, true),
    ('Bicycle Repair', '🚴', 8, true),
    ('Automotive', '🚗', 9, true),
    ('Jewelry', '💍', 10, true),
    ('Leather', '👜', 11, true),
    ('Musical Instruments', '🎸', 12, true),
    ('Ceramics & Glass', '🏺', 13, true),
    ('Gardening Tools', '🌱', 14, true),
    ('General Handyman', '🛠️', 15, true),
    ('Furniture', '🪑', 16, true),
    ('Clothing', '👕', 17, true),
    ('Bicycles', '🚲', 18, true)
ON CONFLICT (name) DO UPDATE SET
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;
