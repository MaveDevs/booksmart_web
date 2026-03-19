import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

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

  apiUrl='http://localhost:8000/api/v1';

  constructor(
    private http:HttpClient,
    @Inject(PLATFORM_ID) private platformId:Object
  ){}

  getHeaders(){

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

  }

  deleteReport(){

    this.http.delete(
      `${this.apiUrl}/reports/${this.reportId}`,
      { headers:this.getHeaders() }
    ).subscribe({
      next:()=>{
        alert("Reporte eliminado");
        this.deleted.emit();
      }
    });

  }

  closeModal(){
    this.close.emit();
  }

}