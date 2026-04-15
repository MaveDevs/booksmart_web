import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-establishment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-establishment.component.html',
  styleUrls: ['./delete-establishment.component.css']
})
export class DeleteEstablishmentComponent {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

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

    console.log("ID a eliminar:", this.establishmentId); 

    if (!this.establishmentId) {
      console.error("❌ ID inválido");
      return;
    }

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/establishments/${this.establishmentId}/`, 
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        console.log("✅ Eliminado correctamente");

        this.showSuccessCard = true;
        this.deleted.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 1500);

      },

      error: (err) => {

        console.error('❌ Error eliminando:', err);
        console.log("Detalle:", err.error);

        this.loading = false;

      }

    });

  }

  closeModal() {
    if (!this.loading) {
      this.close.emit();
    }
  }

  onBackdropClick() {
    if (!this.loading) {
      this.closeModal();
    }
  }

}