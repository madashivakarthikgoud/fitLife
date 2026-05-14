-- Seed the single demo user (id=1). INSERT IGNORE is idempotent across restarts.
INSERT IGNORE INTO users (
    id, full_name, email, password,
    age, gender, height_cm, weight_kg,
    activity_level, fitness_goal,
    created_at, updated_at
) VALUES (
    1, 'Demo User', 'demo@fitlife.com',
    '$2a$10$slYQmyNdgTY18LGvgxPwHOYez.jO0Kp9V5VZsPNxqLMGBJP1/mOJm',
    30, 'Male', 175.0, 75.0,
    'MODERATELY_ACTIVE', 'GENERAL_FITNESS',
    NOW(), NOW()
);
