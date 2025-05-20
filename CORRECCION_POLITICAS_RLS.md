# Corrección de Políticas RLS en Supabase Storage

## Explicación del Error

El error que estás experimentando:

```
ERROR: 42601: only WITH CHECK expression allowed for INSERT
```

Este error ocurre porque las políticas de seguridad de nivel de fila (RLS) en Supabase tienen una sintaxis específica para las operaciones de INSERT. A diferencia de otras operaciones (SELECT, UPDATE, DELETE) que utilizan la cláusula `USING`, las políticas para INSERT requieren utilizar la cláusula `WITH CHECK` en su lugar.

## Sintaxis Correcta para Políticas RLS

La sintaxis correcta para crear políticas RLS en Supabase depende del tipo de operación:

1. **Para operaciones SELECT, UPDATE y DELETE**:
   ```sql
   CREATE POLICY "nombre_politica" 
   ON tabla
   FOR operacion
   TO rol
   USING (expresion);
   ```

2. **Para operaciones INSERT**:
   ```sql
   CREATE POLICY "nombre_politica" 
   ON tabla
   FOR INSERT
   TO rol
   WITH CHECK (expresion);
   ```

## Ejemplos Corregidos para Operaciones INSERT

### Permitir inserciones públicas en el bucket 'advertisements'

```sql
-- Política correcta para permitir a todos los usuarios subir archivos
CREATE POLICY "Allow public uploads" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'advertisements');
```

### Permitir inserciones solo para ciertos tipos de archivos

```sql
-- Política para permitir solo imágenes y videos
CREATE POLICY "Allow image and video uploads" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (
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

### Permitir inserciones solo para usuarios autenticados

```sql
-- Política para permitir solo a usuarios autenticados subir archivos
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'advertisements');
```

## Conjunto Completo de Comandos SQL Corregidos

Para configurar correctamente todas las políticas necesarias para el bucket 'advertisements', utiliza estos comandos:

```sql
-- 1. Permitir a todos subir archivos (INSERT)
CREATE POLICY "Allow public uploads" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'advertisements');

-- 2. Permitir a todos descargar/ver archivos (SELECT)
CREATE POLICY "Allow public downloads" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'advertisements');

-- 3. Permitir a todos actualizar archivos (UPDATE)
CREATE POLICY "Allow public updates" 
ON storage.objects 
FOR UPDATE 
TO public
USING (bucket_id = 'advertisements');

-- 4. Permitir a todos eliminar archivos (DELETE)
CREATE POLICY "Allow public deletes" 
ON storage.objects 
FOR DELETE 
TO public
USING (bucket_id = 'advertisements');
```

## Verificando que las Políticas Funcionan

Después de ejecutar estos comandos en el SQL Editor de Supabase:

1. Navega a la sección **Storage** > **Policies** en tu proyecto Supabase
2. Deberías ver las 4 políticas listadas para el bucket 'advertisements'
3. Intenta subir un archivo nuevamente desde tu aplicación

Si continúas teniendo problemas, asegúrate de que:

1. El bucket 'advertisements' existe y está configurado correctamente
2. Estás utilizando la URL y la clave anónima correctas en tu archivo .env.local
3. No hay políticas existentes que puedan estar en conflicto (puedes eliminarlas desde la interfaz si es necesario)

## Nota sobre Seguridad

Recuerda que estas políticas permiten acceso público total al bucket 'advertisements'. Esto es adecuado para este proyecto que no requiere autenticación, pero para un entorno de producción con datos sensibles, considera implementar políticas más restrictivas cuando implementes autenticación.

