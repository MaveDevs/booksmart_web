import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-edit-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-agenda.component.html',
  styleUrls: ['./edit-agenda.component.css']
})
export class EditAgendaComponent implements OnInit {

  @Input() agendaId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  agenda: any = {};
  establishments: any[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    this.loadEstablishments();
    this.loadAgenda();
  }

  getHeaders(){
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });
  }

  loadAgenda(){
    this.http.get(`${this.apiUrl}/agendas/${this.agendaId}`, {
      headers:this.getHeaders()
    }).subscribe((data:any)=>{
      this.agenda = data;

      this.agenda.hora_inicio = this.agenda.hora_inicio.slice(0,5);
      this.agenda.hora_fin = this.agenda.hora_fin.slice(0,5);
    });
  }

  loadEstablishments(){
    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers:this.getHeaders()
    }).subscribe(data => this.establishments = data);
  }

  update(){

    const payload = {
      ...this.agenda,
      hora_inicio: this.agenda.hora_inicio + ':00',
      hora_fin: this.agenda.hora_fin + ':00'
    };

    this.http.put(`${this.apiUrl}/agendas/${this.agendaId}`, payload, {
      headers:this.getHeaders()
    }).subscribe(()=>{
      this.updated.emit();
    });

  }

}