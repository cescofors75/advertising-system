# Configuración de Supabase para el Sistema de Publicidad Digital

Esta guía te ayudará a configurar Supabase como backend para el sistema de publicidad digital. Sigue estos pasos para crear las tablas necesarias, configurar el almacenamiento y obtener las credenciales para conectar tu aplicación Next.js con Supabase.

## 1. Crear un Nuevo Proyecto en Supabase

1. Inicia sesión en [Supabase](https://supabase.com) o crea una cuenta si aún no tienes una.

2. Una vez en el dashboard, haz clic en el botón "New Project".
   *(Aquí iría una captura de pantalla del botón "New Project")*

3. Completa la información del proyecto:
   - **Name**: Elige un nombre para tu proyecto (por ejemplo, "advertising-system")
   - **Database Password**: Crea una contraseña segura (guárdala en un lugar seguro)
   - **Region**: Selecciona la región más cercana a tus usuarios para mejor rendimiento
   - **Pricing Plan**: Puedes comenzar con el plan gratuito para desarrollo

4. Haz clic en "Create New Project" y espera a que se complete la creación (puede tomar unos minutos).
   *(Aquí iría una captura de pantalla del formulario de creación de proyecto)*

## 2. Ejecutar Comandos SQL para Crear las Tablas

1. Una vez que tu proyecto esté listo, navega a la sección "SQL Editor" en el menú lateral izquierdo.
   *(Aquí iría una captura de pantalla mostrando la ubicación del SQL Editor)*

2. Haz clic en "New Query" para crear una nueva consulta SQL.

3. Abre el archivo `supabase_setup.sql` en tu proyecto local y copia todo su contenido.

4. Pega el contenido en el editor SQL de Supabase.

5. Haz clic en "Run" para ejecutar los comandos SQL. Estos comandos crearán:
   - La tabla `advertisements` para almacenar información sobre los anuncios
   - La tabla `schedules` para gestionar los horarios de los anuncios
   - Índices para optimizar el rendimiento de las consultas

6. Verifica que las tablas se hayan creado correctamente navegando a la sección "Table Editor" en el menú lateral.
   *(Aquí iría una captura de pantalla de las tablas creadas en el Table Editor)*

## 3. Configurar el Almacenamiento para los Archivos Multimedia

1. Navega a la sección "Storage" en el menú lateral izquierdo.
   *(Aquí iría una captura de pantalla mostrando la ubicación de Storage)*

2. Haz clic en "Create New Bucket".

3. Configura el bucket:
   - **Name**: `advertisements` (¡importante usar exactamente este nombre!)
   - **Public bucket**: Activa esta opción para que los archivos sean accesibles públicamente
   - **File size limit**: Puedes establecer un límite de tamaño (recomendado: 10MB)

4. Haz clic en "Create Bucket" para crear el depósito de almacenamiento.
   *(Aquí iría una captura de pantalla del formulario de creación de bucket)*

5. Configura los permisos del bucket:
   - Navega a la pestaña "Policies" dentro de la sección Storage
   - Haz clic en "New Policy"
   - Para una configuración simple, puedes crear una política que permita acceso público:
     - Selecciona "GET" (para permitir leer archivos)
     - En "Definition", usa `true` para permitir acceso a todos
     - Haz clic en "Save Policy"
   - Repite el proceso para crear políticas para "INSERT", "UPDATE" y "DELETE" si necesitas permitir estas operaciones sin autenticación
   *(Aquí iría una captura de pantalla de la configuración de políticas)*

## 4. Obtener las Credenciales para la Conexión

1. Navega a la sección "Project Settings" en el menú lateral izquierdo (icono de engranaje).
   *(Aquí iría una captura de pantalla mostrando la ubicación de Project Settings)*

2. Selecciona la pestaña "API".

3. Aquí encontrarás:
   - **URL**: Es la URL de tu proyecto Supabase (comienza con `https://` y termina con `.supabase.co`)
   - **anon/public key**: Es la clave pública que utilizará tu aplicación

4. Copia estos valores y actualiza tu archivo `.env.local` con:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

5. Guarda el archivo `.env.local` y reinicia tu servidor de desarrollo si estaba en ejecución.
   *(Aquí iría una captura de pantalla de la página de API con las credenciales)*

## 5. Verificar la Configuración

1. Inicia tu aplicación con `npm run dev`.

2. Navega a `http://localhost:3000/admin` para acceder al panel de administración.

3. Intenta crear un nuevo anuncio y subir una imagen o video. Si todo está configurado correctamente:
   - La imagen/video se subirá al bucket de almacenamiento
   - La información del anuncio se guardará en la tabla `advertisements`
   - Los horarios se guardarán en la tabla `schedules`

4. Navega a `http://localhost:3000/display` para verificar que los anuncios se muestren correctamente.

## Solución de Problemas Comunes

- **Error de CORS**: Si encuentras errores de CORS, verifica la configuración del bucket de Storage y asegúrate de que las políticas permitan acceso desde tu dominio.

- **Error de Autenticación**: Verifica que las claves en `.env.local` sean correctas y que estés usando los prefijos `NEXT_PUBLIC_`.

- **Archivos no visibles**: Asegúrate de que el bucket sea público y que la política de GET esté configurada correctamente.

- **Error al subir archivos**: Verifica que la política de INSERT esté configurada correctamente para el bucket de almacenamiento.

¡Felicidades! Ahora tienes Supabase configurado como backend para tu sistema de publicidad digital.

