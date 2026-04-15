import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.css']
})
export class CreateReportComponent implements OnInit {

  apiUrl = environment.apiUrl;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  establishments: any[] = [];

  report = {
    establecimiento_id: 0,
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadEstablishments();
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

  loadEstablishments() {

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.establishments = data;
      },
      error: (err) => {
        console.error('Error cargando establecimientos', err);
      }
    });

  }

  createReport() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.post(
      `${this.apiUrl}/reports/`,
      this.report,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.created.emit();
        this.close.emit(); 
      },

      error: (err) => {
        console.error('Error creando reporte', err);
      }

    });

  }

  closeModal() {
    this.close.emit();
  }

}