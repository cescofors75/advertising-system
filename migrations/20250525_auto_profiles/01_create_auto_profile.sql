-- Crear una función que automáticamente crea un perfil de usuario cuando se registra un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, is_active)
  VALUES (NEW.id, 'viewer', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear un trigger que se dispara cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Para nuevos usuarios, se les asigna el rol 'viewer' por defecto
-- Los administradores pueden cambiar el rol después si es necesario

-- Asegurarse de que los usuarios existentes tengan un perfil
INSERT INTO public.user_profiles (user_id, role, is_active)
SELECT id, 'viewer', TRUE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Asegurarse de que los usuarios admin conocidos tengan el rol correcto
UPDATE public.user_profiles
SET role = 'admin'
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email = 'cescofors75@gmail.com' OR email = 'info@baco.cat' OR email = 'admin@demo.com'
)
AND role != 'admin';

-- Asignar roles a usuarios de demo si existen
UPDATE public.user_profiles
SET role = 'editor', first_name = 'Editor', last_name = 'Demo'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'editor@demo.com'
)
AND role != 'editor';

