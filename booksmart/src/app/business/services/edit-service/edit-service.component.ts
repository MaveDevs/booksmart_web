import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.css']
})
export class EditServiceComponent implements OnChanges {

  @Input() serviceId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8000/api/v1';

  service: any = {};

  showSuccessCard: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceId'] && this.serviceId) {
      this.loadService();
    }
  }

  getHeaders() {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  loadService() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/services/${this.serviceId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data: any) => {
        this.service = data;
      },
      error: (err) => {
        console.error('Error cargando servicio:', err);
      }
    });

  }

  updateService() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.put(
      `${this.apiUrl}/services/${this.serviceId}`,
      this.service,
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
        console.error('Error actualizando servicio:', err);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}