-- ============================================================
-- Seed Data for Advertising System (Azure SQL Database)
-- Run AFTER 01_create_schema.sql
-- ============================================================
-- Auth: user=publi2026 / pass=20262026 (hardcoded in lib/auth.js)
-- ============================================================

-- ============================================================
-- 1. ADVERTISEMENTS
-- ============================================================
INSERT INTO advertisements 
    (title, description, media_type, active, website_url, show_qr_code, qr_type, qr_position, qr_color_web, time_slot_morning, time_slot_afternoon, time_slot_night)
VALUES 
    (N'Bienvenido a Publi-Taxi', 
     N'Sistema de publicidad digital en taxis de la Costa Brava. Contacta con nosotros para anunciar tu negocio.', 
     'image', 1, N'https://visittoo.com', 1, 'web', 'bottom', 'blue',
     1, 1, 1),

    (N'Restaurante La Marina', 
     N'Los mejores arroces y pescados frescos del Mediterráneo. Reserva tu mesa ahora.', 
     'image', 1, N'https://example.com/lamarina', 1, 'web', 'bottom', 'black',
     1, 1, 0),

    (N'Hotel Costa Brava Resort', 
     N'Escapada romántica con spa incluido. Oferta especial: 20% de descuento este mes.', 
     'image', 1, N'https://example.com/hotelcostabrava', 1, 'web', 'top', 'purple',
     1, 1, 1),

    (N'Excursiones Marítimas', 
     N'Descubre las calas secretas de la Costa Brava en barco. Salidas diarias desde Palamós.', 
     'image', 1, NULL, 0, 'web', 'top', 'black',
     1, 0, 0),

    (N'Farmacia Central', 
     N'Abierta 24h. Servicio de entrega a domicilio. Tu salud es nuestra prioridad.', 
     'image', 0, NULL, 0, 'web', 'top', 'black',
     0, 1, 1);

-- ============================================================
-- 2. SCHEDULES (sample schedules for first 2 ads)
-- ============================================================
INSERT INTO schedules (advertisement_id, start_time, end_time)
VALUES 
    (1, '2026-02-17T00:00:00+00:00', '2026-12-31T23:59:59+00:00'),
    (2, '2026-02-17T00:00:00+00:00', '2026-06-30T23:59:59+00:00'),
    (3, '2026-03-01T00:00:00+00:00', '2026-08-31T23:59:59+00:00');

PRINT '✅ Seed data inserted: 5 advertisements, 3 schedules';
GO
