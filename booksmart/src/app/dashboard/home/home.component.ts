import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  users: any[] = [];
  establishments: any[] = [];
  appointments: any[] = [];
  services: any[] = [];

  totalUsers = 0;
  totalEstablishments = 0;
  totalAppointments = 0;

  citasPendientes = 0;
  citasCompletadas = 0;

  citasPorLocal: any[] = [];
  topClientes: any[] = [];
  proximasCitas: any[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
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

  loadDashboard() {

    forkJoin({

      users: this.http.get<any[]>(`${this.apiUrl}/users/`, { headers: this.getHeaders() }),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() }),
      appointments: this.http.get<any[]>(`${this.apiUrl}/appointments/`, { headers: this.getHeaders() }),
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() })

    }).subscribe({

      next: (res) => {

        this.users = res.users;
        this.establishments = res.establishments;
        this.appointments = res.appointments;
        this.services = res.services;

        this.totalUsers = this.users.length;
        this.totalEstablishments = this.establishments.length;
        this.totalAppointments = this.appointments.length;

        this.citasPendientes = this.appointments.filter(a => a.estado === 'PENDIENTE').length;
        this.citasCompletadas = this.appointments.filter(a => a.estado === 'COMPLETADA').length;

        this.citasPorLocal = this.establishments.map(est => ({
          nombre: est.nombre,
          total: this.appointments.filter(a => a.establecimiento_id === est.establecimiento_id).length
        }));

        const conteo: any = {};
        this.appointments.forEach(a => {
          conteo[a.cliente_id] = (conteo[a.cliente_id] || 0) + 1;
        });

        this.topClientes = Object.entries(conteo)
          .map(([id, total]) => {
            const user = this.users.find(u => u.usuario_id == id);
            return {
              nombre: user ? user.nombre : 'Cliente',
              total
            };
          })
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 5);

        this.proximasCitas = this.appointments
          .map(a => {

            const user = this.users.find(u => u.usuario_id === a.cliente_id);
            const service = this.services.find(s => s.servicio_id === a.servicio_id);
            const est = this.establishments.find(e => e.establecimiento_id === a.establecimiento_id);

            return {
              ...a,
              cliente: user ? `${user.nombre} ${user.apellido}` : 'N/A',
              servicio: service?.nombre || 'N/A',
              negocio: est?.nombre || 'N/A'
            };

          })
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 6);

      },

      error: (err) => {
        console.error('Error cargando dashboard', err);
      }

    });

  }

}