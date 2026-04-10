import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EditAppointmentComponent } from './edit-appointment/edit-appointment.component';
import { DeleteAppointmentComponent } from './delete-appointment/delete-appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';

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

  private apiUrl = 'http://localhost:8000/api/v1';

  appointments: any[] = [];
  filteredAppointments: any[] = [];

  users: any[] = [];
  services: any[] = [];
  establishments: any[] = [];

  searchTerm: string = '';

  loading = false;

  showModal = false;
  selectedId!: number;
  showDeleteModal = false;
  showCreateModal = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  getHeaders() {
    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadAllData() {

    this.loading = true;

    forkJoin({
      appointments: this.http.get<any[]>(`${this.apiUrl}/appointments/`, { headers: this.getHeaders() }),
      users: this.http.get<any[]>(`${this.apiUrl}/users/`, { headers: this.getHeaders() }),
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() }),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {

        this.users = res.users;
        this.services = res.services;
        this.establishments = res.establishments;

        this.appointments = res.appointments.map(cita => {

          const cliente = this.users.find(u => u.usuario_id === cita.cliente_id);
          const servicio = this.services.find(s => s.servicio_id === cita.servicio_id);

          const establecimiento = this.establishments.find(
            e => e.establecimiento_id === servicio?.establecimiento_id
          );

          return {
            ...cita,
            cliente_nombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin nombre',
            servicio_nombre: servicio ? servicio.nombre : 'Sin servicio',
            establecimiento_nombre: establecimiento ? establecimiento.nombre : '—'
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