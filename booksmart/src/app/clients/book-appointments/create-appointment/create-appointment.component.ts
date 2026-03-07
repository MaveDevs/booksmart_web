import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
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
export class CreateAppointmentComponent {

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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  createAppointment() {

    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('access_token');

    this.http.post(
      `${this.apiUrl}/appointments/`,
      this.appointment,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      }
    ).subscribe({
      next: () => {
        alert('Cita creada correctamente');
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear la cita');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}