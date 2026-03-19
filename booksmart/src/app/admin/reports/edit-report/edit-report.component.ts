import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  apiUrl='http://localhost:8000/api/v1';

  report:any={};

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

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });

  }

  loadReport(){

    this.http.get(
      `${this.apiUrl}/reports/${this.reportId}`,
      { headers:this.getHeaders() }
    ).subscribe({
      next:(data)=>{
        this.report = data;
      }
    });

  }

  updateReport(){

    this.http.put(
      `${this.apiUrl}/reports/${this.reportId}`,
      this.report,
      { headers:this.getHeaders() }
    ).subscribe({
      next:()=>{
        alert("Reporte actualizado");
        this.updated.emit();
      }
    });

  }

  closeModal(){
    this.close.emit();
  }

}