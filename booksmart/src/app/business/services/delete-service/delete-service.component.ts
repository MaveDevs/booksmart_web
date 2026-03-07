import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-delete-service',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './delete-service.component.html',
  styleUrls: ['./delete-service.component.css']
})
export class DeleteServiceComponent {

  @Input() serviceId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8000/api/v1';

  showSuccessCard = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders() {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  deleteService() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.delete(
      `${this.apiUrl}/services/${this.serviceId}`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.showSuccessCard = true;

        this.deleted.emit();

        setTimeout(() => {

          this.showSuccessCard = false;
          this.close.emit();

        }, 1500);

      },

      error: (err) => {
        console.error('Error eliminando servicio:', err);
      }

    });

  }

  closeModal() {
    this.close.emit();
  }

}