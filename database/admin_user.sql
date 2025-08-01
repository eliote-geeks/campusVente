-- Insertion de l'utilisateur administrateur CampusVente
-- À exécuter après la création des tables

INSERT INTO `users` (
    `id`, 
    `name`, 
    `email`, 
    `birth_date`, 
    `gender`, 
    `looking_for`, 
    `email_verified_at`, 
    `password`, 
    `remember_token`, 
    `created_at`, 
    `updated_at`, 
    `phone`, 
    `whatsapp_number`, 
    `dating_active`, 
    `max_distance`, 
    `dating_preferences`, 
    `university`, 
    `study_level`, 
    `field`, 
    `bio`, 
    `bio_dating`, 
    `interests`, 
    `dating_photos`, 
    `location`, 
    `address`, 
    `total_likes_sent`, 
    `total_likes_received`, 
    `total_matches`, 
    `conversations_started`, 
    `is_student`, 
    `is_admin`, 
    `rating`, 
    `avatar`, 
    `verified`, 
    `last_seen`, 
    `campus_love_access`, 
    `campus_love_activated_at`, 
    `campus_love_premium`, 
    `campus_love_premium_activated_at`
) VALUES (
    1,
    'Administrateur CampusVente',
    'admin@campusvente.com',
    NULL,
    NULL,
    NULL,
    NOW(),
    '$2y$12$tfWJoELA3TaByWJVoCBEW.po4VqXIatCtfvelPbLSugoiglDgsY1S', -- mot de passe: admin123
    NULL,
    NOW(),
    NOW(),
    NULL,
    NULL,
    1,
    50,
    NULL,
    'Administration',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    0,
    0,
    0,
    0,
    1, -- is_admin = true
    0.00,
    NULL,
    0,
    NULL,
    0,
    NULL,
    0,
    NULL
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `email` = VALUES(`email`),
    `is_admin` = VALUES(`is_admin`),
    `updated_at` = NOW();