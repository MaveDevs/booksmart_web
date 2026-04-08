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

  citasPorLocal: any[] = [];
  proximasCitas: any[] = [];

  analytics: any = null;

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
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() }),
      analytics: this.http.get<any>(`${this.apiUrl}/analytics/system-overview`, { headers: this.getHeaders() })
    }).subscribe({

      next: (res) => {

        this.users = res.users;
        this.establishments = res.establishments;
        this.appointments = res.appointments;
        this.services = res.services;

        const serviceToEstMap: any = {};
        this.services.forEach(s => {
          serviceToEstMap[s.servicio_id] = s.establecimiento_id;
        });

        this.citasPorLocal = this.establishments.map(est => {

          const total = this.appointments.filter(a => {
            const estId = serviceToEstMap[a.servicio_id];
            return estId === est.establecimiento_id;
          }).length;

          return {
            nombre: est.nombre,
            total
          };

        }).sort((a, b) => b.total - a.total);

        this.proximasCitas = this.appointments

          .filter(a => a.estado === 'PENDIENTE')

          .filter(a => {
            const fechaHora = new Date(`${a.fecha}T${a.hora_inicio}`);
            return fechaHora >= new Date();
          })

          .map(a => {

            const user = this.users.find(u => u.usuario_id === a.cliente_id);
            const service = this.services.find(s => s.servicio_id === a.servicio_id);

            const estId = service?.establecimiento_id;
            const est = this.establishments.find(e => e.establecimiento_id === estId);

            return {
              ...a,
              cliente: user ? `${user.nombre} ${user.apellido}` : 'N/A',
              servicio: service?.nombre || 'N/A',
              negocio: est?.nombre || 'N/A'
            };

          })

          .sort((a, b) => {
            const f1 = new Date(`${a.fecha}T${a.hora_inicio}`).getTime();
            const f2 = new Date(`${b.fecha}T${b.hora_inicio}`).getTime();
            return f1 - f2;
          })

          .slice(0, 6);

        this.analytics = res.analytics;

      },

      error: (err) => {
        console.error('Error cargando dashboard', err);
      }

    });

  }

}