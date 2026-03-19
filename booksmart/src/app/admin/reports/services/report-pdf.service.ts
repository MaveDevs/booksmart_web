import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ReportPdfService {

  async generatePDF(report: any) {

    try {

      // Cargar la plantilla HTML
      const response = await fetch('/report-template.html');

      if (!response.ok) {
        console.error('No se pudo cargar la plantilla del reporte');
        return;
      }

      const html = await response.text();

      // Crear contenedor temporal
      const container = document.createElement('div');
      container.innerHTML = html;

      // Insertar los datos del reporte
      const establecimiento = container.querySelector('#establecimiento');
      const direccion = container.querySelector('#direccion');
      const telefono = container.querySelector('#telefono');
      const descripcion = container.querySelector('#descripcion');
      const fecha = container.querySelector('#fecha');

      if (establecimiento) establecimiento.textContent = report.establecimiento_nombre || 'N/A';
      if (direccion) direccion.textContent = report.direccion || 'No disponible';
      if (telefono) telefono.textContent = report.telefono || 'No disponible';
      if (descripcion) descripcion.textContent = report.descripcion || 'Sin descripción';
      if (fecha) fecha.textContent = report.fecha_generacion || 'N/A';

      document.body.appendChild(container);

      const element = container.querySelector('#pdf-template') as HTMLElement;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      await doc.html(element, {
        callback: (doc) => {
          doc.save(`reporte_${report.reporte_id}.pdf`);
        },
        x: 10,
        y: 10,
        width: 180,
        html2canvas: {
          scale: 0.6
        }
      });

      document.body.removeChild(container);

    } catch (error) {
      console.error('Error generando el PDF:', error);
    }

  }

}