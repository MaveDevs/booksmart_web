import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-establishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-establishment.component.html',
  styleUrls: ['./edit-establishment.component.css']
})
export class EditEstablishmentComponent implements OnChanges {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishment: any = {};
  showSuccessCard: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['establishmentId'] && this.establishmentId) {
      this.loadEstablishment();
    }
  }

  getHeaders() {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadEstablishment() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/establishments/${this.establishmentId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data: any) => {
        this.establishment = data;
      },
      error: (err) => {
        console.error('Error cargando establecimiento:', err);
      }
    });
  }

  updateEstablishment() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.put(
      `${this.apiUrl}/establishments/${this.establishmentId}`,
      this.establishment,
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
        console.error('Error actualizando:', err);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}