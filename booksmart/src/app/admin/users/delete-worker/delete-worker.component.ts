import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-delete-worker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-worker.component.html',
  styleUrls: ['./delete-worker.component.css']
})
export class DeleteWorkerComponent {

  @Input() workerId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders(){
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('access_token') || ''
      : '';

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });
  }

  deleteWorker(){

    this.http.delete(
      `${this.apiUrl}/workers/${this.workerId}`,
      { headers:this.getHeaders() }
    ).subscribe({
      next:()=>{
        this.deleted.emit();
        this.close.emit();
      },
      error:(err)=>console.error(err)
    });

  }

  closeModal(){
    this.close.emit();
  }
}