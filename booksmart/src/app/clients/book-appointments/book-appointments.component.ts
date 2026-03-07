import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { EditAppointmentComponent } from './edit-appointment/edit-appointment.component';
import { DeleteAppointmentComponent } from './delete-appointment/delete-appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';

@Component({
  selector: 'app-book-appointments',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
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
  users: any[] = [];
  services: any[] = [];

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
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {

        this.users = res.users;
        this.services = res.services;

        this.appointments = res.appointments.map(cita => {

          const cliente = this.users.find(u => u.usuario_id === cita.cliente_id);
          const servicio = this.services.find(s => s.servicio_id === cita.servicio_id);

          return {
            ...cita,
            cliente_nombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin nombre',
            servicio_nombre: servicio ? servicio.nombre : 'Sin servicio'
          };
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.loading = false;
      }
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