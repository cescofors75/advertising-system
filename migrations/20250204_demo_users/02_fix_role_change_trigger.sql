-- Fix para el trigger check_role_change para permitir asignación desde SQL Editor
-- Este fix permite cambios de rol cuando:
-- 1. No hay usuario autenticado (ejecución desde SQL Editor)
-- 2. El usuario autenticado es admin
-- 3. Es la primera vez que se asigna el rol (INSERT via ON CONFLICT DO UPDATE)

CREATE OR REPLACE FUNCTION check_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Permitir cambios si:
    -- 1. No hay sesión autenticada (scripts SQL desde editor)
    -- 2. El usuario autenticado es admin
    -- 3. El rol no ha cambiado
    IF OLD.role != NEW.role AND
       auth.uid() IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
    THEN
        RAISE EXCEPTION 'No tienes permiso para cambiar tu rol';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
