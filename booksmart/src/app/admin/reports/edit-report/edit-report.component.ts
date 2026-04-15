import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-report',
  standalone: true,
  imports:[
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl:'./edit-report.component.html',
  styleUrls:['./edit-report.component.css']
})
export class EditReportComponent implements OnChanges {

  @Input() reportId!:number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  report:any={};

  showSuccessCard = false;

  constructor(
    private http:HttpClient,
    @Inject(PLATFORM_ID) private platformId:Object
  ){}

  ngOnChanges(){
    if(this.reportId){
      this.loadReport();
    }
  }

  getHeaders(){

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });

  }

  loadReport(){

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/reports/${this.reportId}`,
      { headers:this.getHeaders() }
    ).subscribe({
      next:(data:any)=>{
        this.report = data;
      },
      error:(err)=>{
        console.error("Error cargando reporte",err);
      }
    });

  }

  updateReport(){

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.put(
      `${this.apiUrl}/reports/${this.reportId}`,
      this.report,
      { headers:this.getHeaders() }
    ).subscribe({

      next:()=>{

        this.showSuccessCard = true;
        this.updated.emit();

        setTimeout(()=>{
          this.showSuccessCard = false;
          this.close.emit();
        },2000);

      },

      error:(err)=>{
        console.error("Error actualizando reporte",err);
      }

    });

  }

  closeModal(){
    this.close.emit();
  }

}