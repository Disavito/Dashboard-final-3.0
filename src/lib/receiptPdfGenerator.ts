import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos del recibo, para asegurar la consistencia
interface ReceiptData {
  correlative: string;
  client_full_name: string;
  client_dni: string;
  monto: number;
  concepto: string;
  fecha_emision: string;
}

// Esta función ahora está aislada y puede ser cargada bajo demanda.
export const generateReceiptPdf = async (data: ReceiptData): Promise<Blob> => {
  const { correlative, client_full_name, client_dni, monto, concepto, fecha_emision } = data;

  // Crear un elemento temporal para renderizar el recibo
  const receiptElement = document.createElement('div');
  receiptElement.style.width = '800px';
  receiptElement.style.padding = '40px';
  receiptElement.style.fontFamily = 'Arial, sans-serif';
  receiptElement.style.color = '#333';
  receiptElement.style.backgroundColor = 'white';
  receiptElement.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 20px; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <div>
          <h1 style="font-size: 24px; margin: 0; font-weight: bold;">ASOCIACIÓN DE VIVIENDA TALLER<br>LOS GRAMADALES</h1>
          <p style="margin: 5px 0 0;">RUC: 20450192971</p>
        </div>
        <div style="text-align: center; border: 2px solid #000; padding: 10px;">
          <h2 style="font-size: 20px; margin: 0;">RECIBO DE PAGO</h2>
          <p style="font-size: 20px; margin: 5px 0 0; font-weight: bold; color: red;">${correlative}</p>
        </div>
      </div>
      <div style="margin-top: 20px;">
        <p><strong>FECHA DE EMISIÓN:</strong> ${format(new Date(fecha_emision), "d 'de' MMMM 'del' yyyy", { locale: es })}</p>
        <p><strong>RECIBÍ DE:</strong> ${client_full_name}</p>
        <p><strong>IDENTIFICADO CON DNI:</strong> ${client_dni}</p>
        <p><strong>LA SUMA DE:</strong> S/ ${monto.toFixed(2)}</p>
        <p><strong>POR CONCEPTO DE:</strong> ${concepto}</p>
      </div>
      <div style="margin-top: 80px; display: flex; justify-content: space-around; text-align: center;">
        <div style="border-top: 1px solid #000; padding-top: 5px; width: 250px;">
          <p>FIRMA DEL TESORERO</p>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 5px; width: 250px;">
          <p>FIRMA DEL INTERESADO</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(receiptElement);

  // Generar el canvas a partir del elemento
  const canvas = await html2canvas(receiptElement, { scale: 2 });
  document.body.removeChild(receiptElement);

  // Crear el PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  return pdf.output('blob');
};
