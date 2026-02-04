# Solución al Error de Política de Seguridad en Supabase Storage

## El error explicado

El error que estás experimentando:

```
Error uploading file: {statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

Se debe a que Supabase tiene habilitado por defecto el sistema de **Row Level Security (RLS)** para proteger el acceso a los datos almacenados, incluidos los archivos en Storage. Cuando intentas subir un archivo, Supabase está verificando si tienes permiso para realizar esta operación según las políticas configuradas, y actualmente no existe una política que permita esta acción.

## Solución paso a paso

### Opción 1: Configuración a través de la interfaz de Supabase

1. Inicia sesión en tu proyecto de Supabase.
2. Navega a la sección **Storage** en el menú lateral.
3. Selecciona el bucket `advertisements`.
4. Haz clic en la pestaña **Policies**.
5. Haz clic en **New Policy**.
6. Para crear una política que permita subir archivos sin autenticación:
   - Define un nombre para la política (ej. "Allow public uploads")
   - En la plantilla, selecciona **INSERT** y luego **For full customization**
   - En el campo **USING expression**, ingresa `true` (esto permite a cualquiera subir archivos)
   - Haz clic en **Save Policy**
7. Repite el proceso para crear políticas para otras operaciones si es necesario:
   - **SELECT** (para permitir leer/visualizar archivos)
   - **UPDATE** (para permitir actualizar archivos existentes)
   - **DELETE** (para permitir eliminar archivos)

### Opción 2: Configuración a través de SQL

Abre el **SQL Editor** en Supabase y ejecuta los siguientes comandos:

```sql
-- Permitir a todos los usuarios subir archivos al bucket 'advertisements'
CREATE POLICY "Allow public uploads" 
ON storage.objects 
FOR INSERT 
TO public
USING (bucket_id = 'advertisements');

-- Permitir a todos los usuarios leer archivos del bucket 'advertisements'
CREATE POLICY "Allow public downloads" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'advertisements');

-- Permitir a todos los usuarios actualizar archivos en el bucket 'advertisements'
CREATE POLICY "Allow public updates" 
ON storage.objects 
FOR UPDATE 
TO public
USING (bucket_id = 'advertisements');

-- Permitir a todos los usuarios eliminar archivos del bucket 'advertisements'
CREATE POLICY "Allow public deletes" 
ON storage.objects 
FOR DELETE 
TO public
USING (bucket_id = 'advertisements');
```

Después de ejecutar estos comandos, deberías poder subir, leer, actualizar y eliminar archivos sin problemas.

## Verificación

Para verificar que las políticas se han aplicado correctamente:

1. Regresa a la sección **Storage** en Supabase.
2. Selecciona el bucket `advertisements`.
3. En la pestaña **Policies**, deberías ver las nuevas políticas activas.
4. Intenta subir un archivo nuevamente desde tu aplicación.

## Políticas más restrictivas (recomendado para producción)

Para entornos de producción, es recomendable implementar políticas más restrictivas. Aquí hay algunas opciones:

### 1. Permitir operaciones solo a usuarios autenticados

```sql
-- Reemplaza las políticas anteriores con estas

-- Solo usuarios autenticados pueden subir archivos
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated
USING (bucket_id = 'advertisements');

-- Todos pueden ver/descargar archivos
CREATE POLICY "Allow public downloads" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'advertisements');

-- Solo usuarios autenticados pueden actualizar sus propios archivos
CREATE POLICY "Allow authenticated updates" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'advertisements' AND auth.uid() = owner);

-- Solo usuarios autenticados pueden eliminar sus propios archivos
CREATE POLICY "Allow authenticated deletes" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'advertisements' AND auth.uid() = owner);
```

### 2. Limitar por tipo de archivo

```sql
-- Permitir solo ciertos tipos de archivos (imágenes y videos)
CREATE POLICY "Allow image and video uploads" 
ON storage.objects 
FOR INSERT 
TO public
USING (
  bucket_id = 'advertisements' AND 
  (
    storage.extension(name) = 'jpg' OR 
    storage.extension(name) = 'jpeg' OR 
    storage.extension(name) = 'png' OR 
    storage.extension(name) = 'gif' OR 
    storage.extension(name) = 'webp' OR
    storage.extension(name) = 'mp4' OR 
    storage.extension(name) = 'webm' OR 
    storage.extension(name) = 'ogg'
  )
);
```

### 3. Limitar tamaño de archivo

Esto se configura a nivel de bucket en la interfaz de Supabase:

1. Ve a **Storage** > selecciona tu bucket
2. Haz clic en **Settings**
3. En **File size limit**, establece el tamaño máximo permitido (ej. 10MB)
4. Guarda los cambios

## Nota importante para este proyecto

Como el sistema de publicidad está diseñado inicialmente sin autenticación, las políticas públicas (opción 1 o 2) son las más adecuadas. Sin embargo, cuando implementes autenticación en el futuro, deberías revisar y actualizar estas políticas para mayor seguridad.

Si sigues teniendo problemas después de aplicar estas soluciones, verifica los logs de Supabase para obtener más detalles sobre el error específico.

