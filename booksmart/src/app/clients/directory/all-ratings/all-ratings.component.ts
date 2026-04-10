import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-all-ratings',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './all-ratings.component.html',
  styleUrls: ['./all-ratings.component.css']
})
export class AllRatingsComponent implements OnInit {

  @Input() establecimientoId!: number;
  @Output() close = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  ratings: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadRatings();
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

  formatFecha(fecha: string): string {
    if (!fecha) return '';

    const [anio, mes, dia] = fecha.split('T')[0].split('-');

    return `${dia}/${mes}/${anio}`;
  }

  loadRatings() {

    this.loading = true;

    this.http.get<any[]>(`${this.apiUrl}/ratings/`, {
      headers: this.getHeaders()
    }).subscribe({

      next: (data) => {

        const filtered = data.filter(
          r => r.establecimiento_id === this.establecimientoId
        );

        if (filtered.length === 0) {
          this.ratings = [];
          this.loading = false;
          return;
        }

        const requests = filtered.map(r =>
          this.http.get<any>(`${this.apiUrl}/users/${r.usuario_id}`, {
            headers: this.getHeaders()
          })
        );

        forkJoin(requests).subscribe(users => {

          this.ratings = filtered.map((r, index) => {
            const user = users[index];

            return {
              ...r,
              usuario_nombre: user?.nombre + ' ' + user?.apellido
            };
          });

          this.loading = false;
        });

      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      }

    });

  }

}