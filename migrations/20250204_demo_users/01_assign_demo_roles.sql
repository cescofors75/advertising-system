-- Asignar roles a usuarios de demo
-- NOTA: Los usuarios deben ser creados primero desde la UI de Supabase
-- (Authentication > Users > Add user)

-- Asignar rol de admin al usuario admin@demo.com
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Admin', 'Demo', 'admin', TRUE
FROM auth.users
WHERE email = 'admin@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'admin',
  first_name = 'Admin',
  last_name = 'Demo',
  is_active = TRUE,
  updated_at = NOW();

-- Asignar rol de editor al usuario editor@demo.com
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Editor', 'Demo', 'editor', TRUE
FROM auth.users
WHERE email = 'editor@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'editor',
  first_name = 'Editor',
  last_name = 'Demo',
  is_active = TRUE,
  updated_at = NOW();

-- Asignar rol de viewer al usuario viewer@demo.com
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Viewer', 'Demo', 'viewer', TRUE
FROM auth.users
WHERE email = 'viewer@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'viewer',
  first_name = 'Viewer',
  last_name = 'Demo',
  is_active = TRUE,
  updated_at = NOW();

-- Verificar que se crearon correctamente
SELECT
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.is_active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('admin@demo.com', 'editor@demo.com', 'viewer@demo.com');
