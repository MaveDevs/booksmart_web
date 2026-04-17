import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { UsersService } from '../../services/users.service';
import { EstablishmentsService } from '../../services/establishments.service';
import { AppointmentsService } from '../../services/appointments.service';
import { BusinessServicesService } from '../../services/business-services.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  users: any[] = [];
  establishments: any[] = [];
  appointments: any[] = [];
  services: any[] = [];

  citasPorLocal: any[] = [];
  proximasCitas: any[] = [];

  analytics: any = null;

  constructor(
    private usersService: UsersService,
    private establishmentsService: EstablishmentsService,
    private appointmentsService: AppointmentsService,
    private servicesService: BusinessServicesService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {

    forkJoin({
      users: this.usersService.getUsers(),
      establishments: this.establishmentsService.getEstablishments(),
      appointments: this.appointmentsService.getAppointments(),
      services: this.servicesService.getServices(),
      analytics: this.analyticsService.getSystemOverview()
    }).subscribe({

      next: (res) => {

        this.users = res.users;
        this.establishments = res.establishments;
        this.appointments = res.appointments;
        this.services = res.services;

        const serviceToEstMap: any = {};
        this.services.forEach(s => {
          serviceToEstMap[s.servicio_id] = s.establecimiento_id;
        });

        this.citasPorLocal = this.establishments.map(est => {

          const total = this.appointments.filter(a => {
            const estId = serviceToEstMap[a.servicio_id];
            return estId === est.establecimiento_id;
          }).length;

          return {
            nombre: est.nombre,
            total
          };

        }).sort((a, b) => b.total - a.total);

        this.proximasCitas = this.appointments

          .filter(a => a.estado === 'PENDIENTE')

          .filter(a => {
            const fechaHora = new Date(`${a.fecha}T${a.hora_inicio}`);
            return fechaHora >= new Date();
          })

          .map(a => {

            const service = this.services.find(s => s.servicio_id === a.servicio_id);

            const estId = service?.establecimiento_id;
            const est = this.establishments.find(e => e.establecimiento_id === estId);

            return {
              ...a,

              cliente: `${a.cliente_nombre || ''} ${a.cliente_apellido || ''}`.trim() || 'N/A',

              servicio: service?.nombre || 'N/A',
              negocio: est?.nombre || 'N/A'
            };

          })

          .sort((a, b) => {
            const f1 = new Date(`${a.fecha}T${a.hora_inicio}`).getTime();
            const f2 = new Date(`${b.fecha}T${b.hora_inicio}`).getTime();
            return f1 - f2;
          })

          .slice(0, 6);

        this.analytics = res.analytics;

      },

      error: (err) => {
        console.error('Error cargando dashboard', err);
      }

    });

  }

}