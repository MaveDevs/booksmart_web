import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-delete-appointment',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './delete-appointment.component.html',
  styleUrls: ['./delete-appointment.component.css']
})
export class DeleteAppointmentComponent {

  @Input() appointmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8000/api/v1';

  showSuccessCard: boolean = false;
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  confirmDelete() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/appointments/${this.appointmentId}/`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccessCard = true;
        this.deleted.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error eliminando cita:', err);
      }
    });
  }

  closeModal() {
    if (!this.loading) {
      this.close.emit();
    }
  }
}