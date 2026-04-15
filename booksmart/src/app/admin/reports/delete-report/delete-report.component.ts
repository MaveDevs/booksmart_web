import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector:'app-delete-report',
  standalone:true,
  imports:[
    CommonModule,
    HttpClientModule
  ],
  templateUrl:'./delete-report.component.html',
  styleUrls:['./delete-report.component.css']
})
export class DeleteReportComponent {

  @Input() reportId!:number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  showSuccessCard = false;
  loading = false;

  constructor(
    private http:HttpClient,
    @Inject(PLATFORM_ID) private platformId:Object
  ){}

  getHeaders(){

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });

  }

  deleteReport(){

    if (!isPlatformBrowser(this.platformId) || this.loading) return;

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/reports/${this.reportId}`,
      { headers:this.getHeaders() }
    ).subscribe({

      next:()=>{

        this.showSuccessCard = true;
        this.deleted.emit();

        setTimeout(()=>{
          this.showSuccessCard = false;
          this.close.emit();
        },1500);

      },

      error:(err)=>{
        console.error("Error eliminando reporte",err);
        this.loading = false;
      }

    });

  }

  closeModal(){
    this.close.emit();
  }

}