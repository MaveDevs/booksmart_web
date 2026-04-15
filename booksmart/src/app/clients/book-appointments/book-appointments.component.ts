import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EditAppointmentComponent } from './edit-appointment/edit-appointment.component';
import { DeleteAppointmentComponent } from './delete-appointment/delete-appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';
import { AppointmentsService } from '../../services/appointments.service';
import { BusinessServicesService } from '../../services/business-services.service';
import { EstablishmentsService } from '../../services/establishments.service';

@Component({
  selector: 'app-book-appointments',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    EditAppointmentComponent,
    DeleteAppointmentComponent,
    CreateAppointmentComponent
  ],
  templateUrl: './book-appointments.component.html',
  styleUrls: ['./book-appointments.component.css']
})
export class BookAppointmentsComponent implements OnInit {

  appointments: any[] = [];
  filteredAppointments: any[] = [];

  services: any[] = [];
  establishments: any[] = [];

  searchTerm: string = '';
  loading = false;

  showModal = false;
  selectedId!: number;
  showDeleteModal = false;
  showCreateModal = false;

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: BusinessServicesService,
    private establishmentsService: EstablishmentsService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {

    this.loading = true;

    forkJoin({
      appointments: this.appointmentsService.getAppointments(),
      services: this.servicesService.getServices(),
      establishments: this.establishmentsService.getEstablishments()
    }).subscribe({
      next: (res) => {

        this.services = res.services;
        this.establishments = res.establishments;

        this.appointments = res.appointments.map(cita => {

          const servicio = this.services.find(
            s => s.servicio_id === cita.servicio_id
          );

          const establecimiento = this.establishments.find(
            e => e.establecimiento_id === servicio?.establecimiento_id
          );

          return {
            ...cita,

            cliente_nombre: `${cita.cliente_nombre} ${cita.cliente_apellido}`,

            servicio_nombre: servicio
              ? servicio.nombre
              : cita.servicio_nombre,

            establecimiento_nombre: establecimiento
              ? establecimiento.nombre
              : '—'
          };
        });

        this.filteredAppointments = [...this.appointments];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.loading = false;
      }
    });
  }

  formatHour(hour: string): string {
    if (!hour) return '';
    return hour.substring(0, 5);
  }

  onSearch() {

    const term = this.searchTerm.toLowerCase();

    this.filteredAppointments = this.appointments.filter(cita => {

      const hora = `${this.formatHour(cita.hora_inicio)} ${this.formatHour(cita.hora_fin)}`;

      return (
        cita.cliente_nombre?.toLowerCase().includes(term) ||
        cita.servicio_nombre?.toLowerCase().includes(term) ||
        cita.establecimiento_nombre?.toLowerCase().includes(term) ||
        cita.fecha?.toLowerCase().includes(term) ||
        hora.toLowerCase().includes(term) ||
        cita.estado?.toLowerCase().includes(term)
      );

    });

  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  reloadAfterCreate() {
    this.closeCreateModal();
    this.loadAllData();
  }

  editAppointment(cita: any) {
    this.selectedId = cita.cita_id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  reloadAfterUpdate() {
    this.closeModal();
    this.loadAllData();
  }

  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  reloadAfterDelete() {
    this.closeDeleteModal();
    this.loadAllData();
  }
}