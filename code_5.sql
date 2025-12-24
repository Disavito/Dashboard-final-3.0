-- 1. Crear la política de UPDATE
-- Permite a CUALQUIER usuario autenticado actualizar (sobrescribir) archivos
-- en el bucket 'comprobante-de-pago'.
CREATE POLICY "Allow authenticated users to update documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'comprobante-de-pago');

-- 2. (Opcional, solo para asegurar que el INSERT es general)
-- Si su política de INSERT no es general, reemplace la existente con esta:
CREATE POLICY "Allow authenticated users to insert documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'comprobante-de-pago');
