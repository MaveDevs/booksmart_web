import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css']
})
export class CreateAppointmentComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  appointment: any = {
    cliente_id: '',
    servicio_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'PENDIENTE'
  };

  users: any[] = [];
  services: any[] = [];
  establishments: any[] = [];

  selectedService: any = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  getHeaders() {

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  loadData() {

   
    this.http.get<any[]>(`${this.apiUrl}/users/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.users = data.filter(u => u.rol_id === 3);
      },
      error: (err) => console.error('Error usuarios', err)
    });

    this.http.get<any[]>(`${this.apiUrl}/services/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Error servicios', err)
    });

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.establishments = data,
      error: (err) => console.error('Error establecimientos', err)
    });

  }

  
  onServiceChange() {

    this.selectedService = this.services.find(
      s => s.servicio_id == this.appointment.servicio_id
    );

  }

 
  getEstablishmentName(id: number) {

    const est = this.establishments.find(
      e => e.establecimiento_id === id
    );

    return est ? est.nombre : '—';

  }


  createAppointment() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.post(
      `${this.apiUrl}/appointments/`,
      this.appointment,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {
        this.created.emit();
        this.close.emit();
      },

      error: (err) => {
        console.error('Error creando cita', err);
      }

    });

  }


  closeModal() {
    this.close.emit();
  }

}