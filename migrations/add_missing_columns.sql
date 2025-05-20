-- Check if columns exist and add them if they don't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='advertisements' AND column_name='website_url') THEN
        ALTER TABLE advertisements ADD COLUMN website_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='advertisements' AND column_name='show_qr_code') THEN
        ALTER TABLE advertisements ADD COLUMN show_qr_code BOOLEAN DEFAULT false;
    END IF;
END $$;

