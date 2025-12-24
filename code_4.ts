    // src/lib/api/invoicingApi.ts (saveBoletaPdfToSupabase)
    const filePath = `${socioId}/${fileName}`; 
    // Ejemplo: eb81aed8-c226-468c-b115-cf6115c27b24/B001-00001.pdf
    ```

2.  **Ruta de Recibo (Fallando):**
    ```typescript
    // src/lib/api/invoicingApi.ts (saveReceiptPdfToSupabase)
    const filePath = `${socioId}/recibos/${fileName}`; 
    // Ejemplo: eb81aed8-c226-468c-b115-cf6115c27b24/recibos/R-00001.pdf
    ```

El error `new row violates row-level security policy` ocurre porque la política de RLS que usted configuró previamente para las boletas probablemente solo permitía la inserción en el **primer nivel** de la carpeta del socio (`{socioId}/`).

Al introducir la subcarpeta `/recibos/`, la nueva ruta ya no cumple con la condición de la política anterior.

### Solución: Ajustar la Política de RLS para Subdirectorios

Para solucionar esto, debe asegurarse de que la política de `INSERT` y `UPDATE` en el bucket `comprobante-de-pago` permita la inserción en cualquier subdirectorio dentro de la carpeta raíz del socio.

Si la política anterior era muy específica, debe reemplazarla por una más general que cubra todos los archivos subidos por usuarios autenticados, ya que la aplicación es la que gestiona la estructura de carpetas.

**Por favor, verifique y aplique nuevamente estas políticas en el SQL Editor de Supabase para el bucket `comprobante-de-pago`:**

