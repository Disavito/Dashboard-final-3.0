-- 1. Habilitar RLS en el bucket (si no está ya habilitado)
-- Esto se hace generalmente en la interfaz de Storage, pero es bueno verificar.

-- 2. Crear o reemplazar la política de INSERT (para la subida inicial)
-- Esta política permite a CUALQUIER usuario autenticado subir archivos al bucket 'comprobante-de-pago'.
CREATE POLICY "Allow authenticated users to insert documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'comprobante-de-pago');

-- 3. Crear o reemplazar la política de UPDATE (para el upsert)
-- Esta política permite a CUALQUIER usuario autenticado actualizar archivos en el bucket 'comprobante-de-pago'.
CREATE POLICY "Allow authenticated users to update documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'comprobante-de-pago');
