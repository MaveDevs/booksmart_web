import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { ReportPdfService } from './services/report-pdf.service';

import { CreateReportComponent } from './create-report/create-report.component';
import { EditReportComponent } from './edit-report/edit-report.component';
import { DeleteReportComponent } from './delete-report/delete-report.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CreateReportComponent,
    EditReportComponent,
    DeleteReportComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  reports: any[] = [];
  establishments: any[] = [];

  loading = false;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedId!: number;

  constructor(
    private http: HttpClient,
    private pdfService: ReportPdfService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadData();
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

  loadData() {

    this.loading = true;

    forkJoin({

      reports: this.http.get<any[]>(`${this.apiUrl}/reports/`, {
        headers: this.getHeaders()
      }),

      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
        headers: this.getHeaders()
      })

    }).subscribe({

      next: (res) => {

        this.establishments = res.establishments;

        this.reports = res.reports.map(report => {

          const est = this.establishments.find(
            e => e.establecimiento_id === report.establecimiento_id
          );

          return {
            ...report,
            establecimiento_nombre: est?.nombre || 'Desconocido',
            direccion: est?.direccion || 'No disponible',
            telefono: est?.telefono || 'No disponible'
          };

        });

        this.loading = false;

      },

      error: (err) => {
        console.error('Error cargando reportes', err);
        this.loading = false;
      }

    });

  }

  downloadReport(report:any){
    this.pdfService.generatePDF(report);
  }

  openCreateModal(){
    this.showCreateModal = true;
  }

  closeCreateModal(){
    this.showCreateModal = false;
  }

  reloadAfterCreate(){
    this.closeCreateModal();
    this.loadData();
  }

  openEditModal(id:number){
    this.selectedId = id;
    this.showEditModal = true;
  }

  closeEditModal(){
    this.showEditModal = false;
  }

  reloadAfterEdit(){
    this.closeEditModal();
    this.loadData();
  }

  openDeleteModal(id:number){
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(){
    this.showDeleteModal = false;
  }

  reloadAfterDelete(){
    this.closeDeleteModal();
    this.loadData();
  }

}