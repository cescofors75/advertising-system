-- Añadir campos para la funcionalidad de pago directo en QR
ALTER TABLE advertisements 
ADD COLUMN qr_type TEXT DEFAULT 'web',
ADD COLUMN product_name TEXT,
ADD COLUMN product_price DECIMAL(10, 2),
ADD COLUMN payment_provider TEXT;

-- Añadir comentarios para documentar los campos
COMMENT ON COLUMN advertisements.qr_type IS 'Tipo de QR: "web" (redirección a página web) o "payment" (pago directo)';
COMMENT ON COLUMN advertisements.product_name IS 'Nombre del producto para pago directo';
COMMENT ON COLUMN advertisements.product_price IS 'Precio del producto para pago directo';
COMMENT ON COLUMN advertisements.payment_provider IS 'Proveedor de pago: stripe, googlepay o applepay';

