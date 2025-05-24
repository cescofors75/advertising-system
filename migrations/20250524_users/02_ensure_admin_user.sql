-- Script para asegurar que el usuario cescofors75@gmail.com tenga perfil de administrador

-- Obtener el ID del usuario
WITH user_id_cte AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'cescofors75@gmail.com'
  LIMIT 1
)

-- Insertar o actualizar el perfil
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Cesco', 'Fors', 'admin', TRUE
FROM user_id_cte
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  is_active = TRUE,
  first_name = COALESCE(user_profiles.first_name, 'Cesco'),
  last_name = COALESCE(user_profiles.last_name, 'Fors'),
  updated_at = NOW();

-- Para verificar, consulta después de ejecutar:
-- SELECT * FROM user_profiles up JOIN auth.users u ON up.user_id = u.id WHERE u.email = 'cescofors75@gmail.com';
