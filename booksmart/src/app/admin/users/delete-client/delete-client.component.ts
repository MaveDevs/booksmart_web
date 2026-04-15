import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-client.component.html',
  styleUrls: ['./delete-client.component.css']
})
export class DeleteClientComponent {

  @Input() clientId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders(){
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });
  }

  deleteClient(){

    this.http.delete(
      `${this.apiUrl}/users/${this.clientId}`,
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