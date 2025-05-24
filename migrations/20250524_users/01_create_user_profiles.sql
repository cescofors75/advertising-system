-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'editor', -- 'admin', 'editor', 'viewer'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Añadir fila para el administrador principal (este SQL se ejecutará cuando ya exista el usuario)
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Cesco', 'Fors', 'admin', TRUE
FROM auth.users 
WHERE email = 'cescofors75@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Crear políticas RLS para seguridad
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden ver todos los perfiles
CREATE POLICY admin_read_all_profiles
    ON user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid() AND up.role = 'admin'
        )
    );

-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY users_read_own_profile
    ON user_profiles
    FOR SELECT
    USING (user_id = auth.uid());

-- Solo los administradores pueden insertar nuevos perfiles
CREATE POLICY admin_insert_profiles
    ON user_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid() AND up.role = 'admin'
        )
    );

-- Solo los administradores pueden actualizar perfiles
CREATE POLICY admin_update_profiles
    ON user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid() AND up.role = 'admin'
        )
    );

-- Los usuarios pueden actualizar su propio perfil (sin restricciones adicionales)
CREATE POLICY users_update_own_profile
    ON user_profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- Función para comprobar que los usuarios no cambien su rol al actualizar su perfil
CREATE OR REPLACE FUNCTION check_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != NEW.role AND 
       NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
    THEN
        RAISE EXCEPTION 'No tienes permiso para cambiar tu rol';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para prevenir cambios no autorizados al rol
DROP TRIGGER IF EXISTS prevent_role_change ON user_profiles;
CREATE TRIGGER prevent_role_change
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION check_role_change();
