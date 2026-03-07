import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-delete-establishment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-establishment.component.html',
  styleUrl: './delete-establishment.component.css'
})
export class DeleteEstablishmentComponent {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

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

    this.http
      .delete(`${this.apiUrl}/establishments/${this.establishmentId}`, {
        headers: this.getHeaders()
      })
      .subscribe({
        next: () => {
          alert('Establecimiento eliminado');
          this.deleted.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar');
        }
      });

  }

  closeModal() {
    this.close.emit();
  }

}