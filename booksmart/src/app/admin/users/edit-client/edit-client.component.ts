import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.css']
})
export class EditClientComponent implements OnChanges {

  @Input() clientId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  client: any = {};

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

  ngOnChanges(){
    this.loadClient();
  }

  loadClient(){

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/users/${this.clientId}`,
      { headers:this.getHeaders() }
    ).subscribe({
      next:(data)=> this.client = data,
      error:(err)=> console.error(err)
    });

  }

  updateClient(){

    this.http.put(
      `${this.apiUrl}/users/${this.clientId}`,
      this.client,
      { headers:this.getHeaders() }
    ).subscribe({
      next:()=>{
        this.updated.emit();
        this.close.emit();
      },
      error:(err)=>console.error(err)
    });

  }

  closeModal(){
    this.close.emit();
  }
}