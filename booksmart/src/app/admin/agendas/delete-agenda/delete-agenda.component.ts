import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-delete-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-agenda.component.html',
  styleUrls: ['./delete-agenda.component.css']
})
export class DeleteAgendaComponent {

  @Input() agendaId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getHeaders(){
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
  }

  delete(){
    this.http.delete(`${this.apiUrl}/agendas/${this.agendaId}`, {
      headers:this.getHeaders()
    }).subscribe(()=>{
      this.deleted.emit();
    });
  }

}