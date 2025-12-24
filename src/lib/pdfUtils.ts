import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReciboPagoFormValues } from './types/invoicing';

// --- Lógica de Conversión de Números a Letras (Simplificada) ---

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DECENAS = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function convertNumberToWords(n: number): string {
    if (n === 0) return 'CERO';
    if (n < 10) return UNIDADES[n];
    if (n === 10) return 'DIEZ';
    if (n < 20) {
        const teens = ['ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE'];
        return teens[n - 11] || (UNIDADES[n % 10] + ' Y DIEZ');
    }
    if (n === 20) return 'VEINTE';
    if (n < 30) return 'VEINTI' + UNIDADES[n % 10];
    if (n < 100) {
        const d = Math.floor(n / 10);
        const u = n % 10;
        return DECENAS[d] + (u > 0 ? ' Y ' + UNIDADES[u] : '');
    }
    if (n === 100) return 'CIEN';
    if (n < 200) return 'CIENTO ' + convertNumberToWords(n - 100);
    if (n < 1000) {
        const c = Math.floor(n / 100);
        const r = n % 100;
        return CENTENAS[c] + (r > 0 ? ' ' + convertNumberToWords(r) : '');
    }
    if (n === 1000) return 'MIL';
    if (n < 2000) return 'MIL ' + convertNumberToWords(n - 1000);
    if (n < 1000000) {
        const m = Math.floor(n / 1000);
        const r = n % 1000;
        let output = convertNumberToWords(m) + (m === 1 ? ' MIL' : ' MIL');
        if (r > 0) {
            output += ' ' + convertNumberToWords(r);
        }
        return output;
    }
    return 'MONTO EXCESIVO';
}

/**
 * Convierte un monto numérico a su representación en letras (Soles).
 * @param amount Monto total (ej: 250.00)
 * @returns Cadena de texto (ej: DOSCIENTOS CINCUENTA SOLES CON 00/100)
 */
export function amountToWords(amount: number): string {
    const parts = amount.toFixed(2).split('.');
    const soles = parseInt(parts[0], 10);
    const centavos = parseInt(parts[1], 10);

    const solesText = convertNumberToWords(soles);
    const centavosText = String(centavos).padStart(2, '0');

    return `${solesText} Y ${centavosText}/100 SOLES`.trim();
}

// --- Tipos para la Generación de PDF ---

interface ReceiptData extends ReciboPagoFormValues {
    correlative: string;
    client_full_name: string;
    client_dni: string;
}

/**
 * Genera el HTML del recibo de pago con un diseño profesional y moderno.
 */
const generateReceiptHtml = (data: ReceiptData): string => {
    const date = new Date(data.fecha_emision);
    // Ajuste para obtener la fecha en la zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();
    
    const amountInWords = amountToWords(data.monto);
    const formattedAmount = data.monto.toFixed(2);
    
    // URL de la imagen de membrete A4 completa
    const backgroundUrl = 'https://n8n-supabase.mv7mvl.easypanel.host/storage/v1/object/public/assets//modelo%20pdf.png';
    
    const primaryColor = '#003366'; // Azul marino corporativo
    const textColor = '#212529'; // Negro estándar
    const secondaryTextColor = '#6c757d'; // Gris secundario

    return `
        <div id="receipt-content" style="
            width: 794px; 
            height: 1123px; 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            font-size: 11pt; 
            color: ${textColor}; 
            background-color: #FFFFFF; /* Fondo blanco base */
            background-image: url('${backgroundUrl}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            box-sizing: border-box; 
            position: relative; 
            display: flex; 
            flex-direction: column;
        ">
            <style>
                * { box-sizing: border-box; font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; }

                .receipt-main-content {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    /* AUMENTADO: Padding superior para bajar el contenido y no chocar con el membrete */
                    padding: 290px 75px 100px 75px; 
                }
                .header-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                }
                .receipt-title {
                    font-size: 26pt;
                    font-weight: bold;
                    color: ${primaryColor};
                    margin: 0;
                    line-height: 1;
                }
                .receipt-meta {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 8px 16px;
                    text-align: center;
                    background-color: #f8f9fa;
                }
                .receipt-correlative-label {
                    font-size: 10pt;
                    font-weight: bold;
                    color: ${primaryColor};
                    text-transform: uppercase;
                    margin: 0;
                }
                .receipt-correlative {
                    font-size: 16pt;
                    font-weight: bold;
                    color: ${textColor};
                    margin: 0;
                }
                .client-details {
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 20px;
                    line-height: 1.7;
                    /* MODIFICADO: Fondo semi-transparente para integrar con marca de agua */
                    background-color: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(2px);
                    margin-bottom: 25px;
                }
                .detail-row {
                    display: flex;
                    margin-bottom: 10px;
                    font-size: 12pt;
                }
                .detail-row:last-child { margin-bottom: 0; }
                .detail-label {
                    width: 130px;
                    font-weight: bold;
                    color: ${secondaryTextColor};
                    flex-shrink: 0;
                }
                .detail-value {
                    flex-grow: 1;
                    font-weight: 500;
                }
                .detail-value.strong {
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .payment-summary {
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                    background-color: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(2px);
                }
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .summary-table th, .summary-table td {
                    padding: 14px 20px;
                    text-align: left;
                    font-size: 11pt;
                }
                .summary-table thead {
                    /* MODIFICADO: Estilo de cabecera más profesional */
                    border-bottom: 2px solid ${primaryColor};
                    color: ${primaryColor};
                    text-transform: uppercase;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                    background-color: transparent;
                }
                .summary-table tbody tr {
                    border-bottom: 1px solid #e9ecef;
                }
                .summary-table tbody tr:last-child {
                    border-bottom: none;
                }
                .summary-total-row {
                    background-color: ${primaryColor};
                    color: #FFFFFF;
                }
                .summary-total-row td {
                    font-size: 16pt;
                    font-weight: bold;
                }
                .footer {
                    margin-top: auto;
                    padding-top: 50px;
                    text-align: center;
                }
                .signature-line {
                    width: 280px;
                    margin: 0 auto;
                    border-top: 1px solid #343a40;
                    padding-top: 8px;
                    font-size: 10pt;
                    font-weight: bold;
                    color: #343a40;
                }
            </style>
            
            <div class="receipt-main-content">
                <div class="header-info">
                    <div>
                        <h1 class="receipt-title">RECIBO DE PAGO</h1>
                        <p style="font-size: 11pt; color: ${secondaryTextColor}; margin-top: 4px;">Fecha de Emisión: ${day}/${month}/${year}</p>
                    </div>
                    <div class="receipt-meta">
                        <p class="receipt-correlative-label">Recibo N°</p>
                        <p class="receipt-correlative">${data.correlative}</p>
                    </div>
                </div>

                <div class="client-details">
                    <div class="detail-row">
                        <span class="detail-label">Recibido de:</span>
                        <span class="detail-value">${data.client_full_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">DNI:</span>
                        <span class="detail-value">${data.client_dni}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">La suma de:</span>
                        <span class="detail-value strong">${amountInWords}</span>
                    </div>
                </div>

                <div class="payment-summary">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th style="width: 180px;">Método de Pago</th>
                                <th style="width: 150px; text-align: right;">N° Operación</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${data.concepto}</td>
                                <td>${data.metodo_pago}</td>
                                <td style="text-align: right;">${data.numero_operacion || '---'}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="summary-total-row">
                                <td colspan="2">TOTAL A PAGAR</td>
                                <td style="text-align: right;">S/ ${formattedAmount}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="footer">
                    <div class="signature-line">
                        FIRMA Y/O SELLO
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Precarga un array de URLs de imágenes para asegurar que estén en caché antes de renderizar.
 * @param urls - Array de URLs de imágenes a precargar.
 * @returns Una promesa que se resuelve cuando todas las imágenes se han cargado.
 */
const preloadImages = (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; 
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    });
    return Promise.all(promises);
};


/**
 * Genera el PDF del recibo de pago a partir de los datos del formulario.
 * @param data Datos del recibo.
 * @returns Blob del archivo PDF.
 */
export const generateReceiptPdf = async (data: ReceiptData): Promise<Blob> => {
    const htmlContent = generateReceiptHtml(data);

    const imageUrls = [
        'https://n8n-supabase.mv7mvl.easypanel.host/storage/v1/object/public/assets//modelo%20pdf.png'
    ];
    try {
        await preloadImages(imageUrls);
    } catch (error) {
        console.error("Error preloading images for PDF:", error);
        throw new Error("Fallo al cargar la imagen de membrete para el recibo. Verifique que la URL es correcta y el bucket es público.");
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    tempDiv.innerHTML = htmlContent;

    try {
        const canvas = await html2canvas(tempDiv.querySelector('#receipt-content') as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Aseguramos fondo blanco por si la imagen tiene transparencias
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Añade la imagen renderizada (con el fondo) al PDF, cubriendo toda la página
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        return pdf.output('blob');

    } catch (error) {
        console.error("Error al generar el PDF del recibo:", error);
        throw new Error("Fallo en la generación del PDF.");
    } finally {
        document.body.removeChild(tempDiv);
    }
};
