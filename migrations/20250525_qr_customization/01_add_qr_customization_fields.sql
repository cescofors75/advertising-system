-- Migración para añadir campos de personalización de QR a la tabla advertisements

-- Añadir campo para la posición del banner QR (top o bottom)
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS qr_position TEXT DEFAULT 'top';

-- Añadir campo para el color del banner QR de tipo web
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS qr_color_web TEXT DEFAULT 'black';

-- Añadir campo para el color del banner QR de tipo payment
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS qr_color_payment TEXT DEFAULT 'orange';

-- Añadir comentarios a los campos para documentación
COMMENT ON COLUMN advertisements.qr_position IS 'Posición del banner QR: "top" (superior) o "bottom" (inferior)';
COMMENT ON COLUMN advertisements.qr_color_web IS 'Color del banner QR de información: "black", "blue", "purple"';
COMMENT ON COLUMN advertisements.qr_color_payment IS 'Color del banner QR de venta: "orange", "red", "green"';

-- Aplicar valores predeterminados a registros existentes
UPDATE advertisements
SET 
  qr_position = 'top',
  qr_color_web = 'black',
  qr_color_payment = 'orange'
WHERE 
  qr_position IS NULL OR 
  qr_color_web IS NULL OR 
  qr_color_payment IS NULL;

