# Crear Usuarios de Demo

Para crear los usuarios de demostración, sigue estos pasos:

## Opción 1: Desde la UI de Supabase (Recomendado)

1. Ve a **Authentication** > **Users** en tu dashboard de Supabase
2. Click en **Add user** > **Create new user**
3. Crea cada usuario con estos datos:

### Usuario Admin
- Email: `admin@demo.com`
- Password: `demo123`
- Auto Confirm User: ✅ (activado)

### Usuario Editor
- Email: `editor@demo.com`
- Password: `demo123`
- Auto Confirm User: ✅ (activado)

### Usuario Viewer
- Email: `viewer@demo.com`
- Password: `demo123`
- Auto Confirm User: ✅ (activado)

## Opción 2: SQL Script

Después de crear los usuarios desde la UI, ejecuta este SQL para asignar los roles:

```sql
-- Asignar rol de admin
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Admin', 'Demo', 'admin', TRUE
FROM auth.users
WHERE email = 'admin@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'admin',
  first_name = 'Admin',
  last_name = 'Demo',
  is_active = TRUE;

-- Asignar rol de editor
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Editor', 'Demo', 'editor', TRUE
FROM auth.users
WHERE email = 'editor@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'editor',
  first_name = 'Editor',
  last_name = 'Demo',
  is_active = TRUE;

-- Asignar rol de viewer
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT id, 'Viewer', 'Demo', 'viewer', TRUE
FROM auth.users
WHERE email = 'viewer@demo.com'
ON CONFLICT (user_id)
DO UPDATE SET
  role = 'viewer',
  first_name = 'Viewer',
  last_name = 'Demo',
  is_active = TRUE;
```

## Verificar

Puedes verificar que se crearon correctamente ejecutando:

```sql
SELECT
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.is_active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('admin@demo.com', 'editor@demo.com', 'viewer@demo.com');
```

## Credenciales de Acceso

Una vez creados, estos son los accesos:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@demo.com | demo123 |
| Editor | editor@demo.com | demo123 |
| Viewer | viewer@demo.com | demo123 |

## Notas

- Los usuarios admin y editor pueden acceder al panel de administración
- El usuario viewer NO puede acceder (será rechazado en el login)
- Estos usuarios son solo para demos y pruebas
- En producción, considera cambiar las contraseñas o desactivarlos
