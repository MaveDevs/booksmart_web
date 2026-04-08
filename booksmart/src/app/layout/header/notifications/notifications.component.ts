import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

  @Input() notifications: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>(); 

  apiUrl = 'http://localhost:8000/api/v1';

  noLeidasCount = 0;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges() {
    this.calcularNoLeidas();
  }

  calcularNoLeidas() {
    this.noLeidasCount = this.notifications.filter(n => !n.leida).length;
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

  marcarLeida(n: any) {
    this.http.patch(`${this.apiUrl}/notifications/${n.notificacion_id}`, {
      leida: true
    }, { headers: this.getHeaders() }).subscribe(() => {
      n.leida = true;
      this.calcularNoLeidas();
      this.updated.emit();
    });
  }

  marcarTodasLeidas() {
    const noLeidas = this.notifications.filter(n => !n.leida);

    noLeidas.forEach(n => {
      this.http.patch(`${this.apiUrl}/notifications/${n.notificacion_id}`, {
        leida: true
      }, { headers: this.getHeaders() }).subscribe(() => {
        n.leida = true;
        this.calcularNoLeidas();
        this.updated.emit();
      });
    });
  }

  hayNoLeidas(): boolean {
    return this.noLeidasCount > 0;
  }

  eliminar(n: any) {
    this.http.delete(`${this.apiUrl}/notifications/${n.notificacion_id}`, {
      headers: this.getHeaders()
    }).subscribe(() => {
      this.notifications = this.notifications.filter(x => x !== n);
      this.calcularNoLeidas();
      this.updated.emit();
    });
  }

}