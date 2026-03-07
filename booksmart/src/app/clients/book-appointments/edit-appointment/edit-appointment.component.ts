import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.css']
})
export class EditAppointmentComponent implements OnChanges {

  @Input() appointmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8000/api/v1';

  appointment: any = {};
  showSuccessCard: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentId'] && this.appointmentId) {
      this.loadAppointment();
    }
  }

  getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadAppointment() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/appointments/${this.appointmentId}/`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data: any) => {
        this.appointment = data;
      },
      error: (err) => {
        console.error('Error cargando cita:', err);
      }
    });
  }

  updateAppointment() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.put(
      `${this.apiUrl}/appointments/${this.appointmentId}/`,
      this.appointment,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {

        this.showSuccessCard = true;
        this.updated.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 2000);

      },
      error: (err) => {
        console.error('Error actualizando cita:', err);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}