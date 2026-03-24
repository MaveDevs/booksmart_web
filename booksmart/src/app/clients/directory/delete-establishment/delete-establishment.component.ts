import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-delete-establishment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-establishment.component.html',
  styleUrls: ['./delete-establishment.component.css'] // 🔥 IMPORTANTE (tenías mal styleUrl)
})
export class DeleteEstablishmentComponent {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  showSuccessCard = false;
  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  deleteEstablishment() {

    if (!isPlatformBrowser(this.platformId) || this.loading) return;

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/establishments/${this.establishmentId}`,
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
        console.error('Error eliminando establecimiento:', err);
        this.loading = false;
      }

    });

  }

  closeModal() {
    this.close.emit();
  }

}