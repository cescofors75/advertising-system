-- Add website_url and show_qr_code fields to the advertisements table
ALTER TABLE advertisements 
ADD COLUMN website_url TEXT,
ADD COLUMN show_qr_code BOOLEAN DEFAULT false;

