import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportPdfService {

  apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  async generatePDF(report: any) {

    try {

      const [appointmentsRes, servicesRes, paymentsRes] = await Promise.all([

        this.http.get<any>(`${this.apiUrl}/appointments/`, {
          headers: this.getHeaders()
        }).toPromise(),

        this.http.get<any>(`${this.apiUrl}/services/`, {
          headers: this.getHeaders()
        }).toPromise(),

        this.http.get<any>(`${this.apiUrl}/payments/?suscripcion_id=1`, {
          headers: this.getHeaders()
        }).toPromise()

      ]);

      const appointments = appointmentsRes?.results || appointmentsRes || [];
      const services = servicesRes?.results || servicesRes || [];
      const payments = paymentsRes?.results || paymentsRes || [];

      const serviciosDelEstablecimiento = services.filter((s: any) =>
        s.establecimiento_id === report.establecimiento_id
      );

      const serviciosIds = serviciosDelEstablecimiento.map((s: any) =>
        s.servicio_id || s.id
      );

      const citas = appointments.filter((a: any) => {
        const servicioId = a.servicio_id || a.servicio || a.service_id;
        return serviciosIds.includes(servicioId);
      });

      const pagos = payments || [];

      const totalCitas = citas.length;

      const clientesSet = new Set(
        citas.map((c: any) =>
          c.cliente_id || c.cliente || c.usuario || c.user_id
        ).filter(Boolean)
      );

      const totalClientes = clientesSet.size;

      const totalIngresos = pagos.reduce(
        (sum: number, p: any) => sum + Number(p.monto || p.amount || 0),
        0
      );

      const serviciosUso = new Map();
      citas.forEach((c: any) => {
        const servicioId = c.servicio_id || c.servicio;
        serviciosUso.set(servicioId, (serviciosUso.get(servicioId) || 0) + 1);
      });

      const servicioTopId =
        [...serviciosUso.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

      const servicioTop =
        services.find((s: any) =>
          (s.servicio_id || s.id) === servicioTopId
        )?.nombre || 'N/A';

      const citasPorDia = new Map();
      citas.forEach((c: any) => {
        const fecha = (c.fecha || '').split('T')[0];
        if (!fecha) return;
        citasPorDia.set(fecha, (citasPorDia.get(fecha) || 0) + 1);
      });

      let fecha = 'N/A';
      if (report.fecha_generacion) {
        fecha = new Date(report.fecha_generacion).toLocaleDateString('es-MX');
      }

      const doc = new jsPDF();

      const logo = new Image();
      logo.src = '/logo.png';
      await new Promise(resolve => logo.onload = resolve);

      doc.addImage(logo, 'PNG', 20, 10, 15, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('BOOKSMART', 40, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Reporte del Sistema', 40, 24);

      doc.line(20, 30, 190, 30);

      let yPos = 40;

      doc.setFontSize(12);
      doc.text(`Fecha: ${fecha}`, 20, yPos);

      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Datos del Establecimiento', 20, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');

      doc.text(`Nombre: ${report.establecimiento_nombre}`, 20, yPos); yPos += 5;
      doc.text(`Dirección: ${report.direccion}`, 20, yPos); yPos += 5;
      doc.text(`Teléfono: ${report.telefono}`, 20, yPos);

      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Descripción', 20, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');

      const descripcion = report.descripcion || 'Sin descripción disponible';
      const splitDesc = doc.splitTextToSize(descripcion, 170);

      doc.text(splitDesc, 20, yPos);
      yPos += splitDesc.length * 5;

      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Ejecutivo', 20, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');

      doc.text(`Citas: ${totalCitas}`, 20, yPos); yPos += 5;
      doc.text(`Clientes: ${totalClientes}`, 20, yPos); yPos += 5;
      doc.text(`Ingresos: $${totalIngresos.toFixed(2)}`, 20, yPos);

      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Servicios', 20, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Más solicitado: ${servicioTop}`, 20, yPos);

      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Actividad por fecha', 20, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');

      citasPorDia.forEach((value, key) => {
        doc.text(`${key}: ${value} citas`, 20, yPos);
        yPos += 5;
      });

      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text('Reporte generado automáticamente por BookSmart', 20, yPos);

      doc.save(`reporte_${report.reporte_id}.pdf`);

    } catch (error) {
      console.error('❌ ERROR PDF:', error);
    }

  }

}