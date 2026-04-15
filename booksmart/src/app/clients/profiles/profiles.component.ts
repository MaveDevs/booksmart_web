import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  profiles: any[] = [];
  establishments: any[] = [];

  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  getHeaders() {

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  loadData() {

    this.loading = true;

    forkJoin({

      profiles: this.http.get<any[]>(`${this.apiUrl}/profiles/`, {
        headers: this.getHeaders()
      }),

      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
        headers: this.getHeaders()
      })

    }).subscribe({

      next: (res) => {

        this.establishments = res.establishments;

        this.profiles = res.profiles.map(profile => {

          const establecimiento = this.establishments.find(
            e => e.establecimiento_id === profile.establecimiento_id
          );

          return {
            ...profile,
            establecimiento_nombre: establecimiento
              ? establecimiento.nombre
              : 'Sin establecimiento'
          };

        });

        this.loading = false;

      },

      error: (err) => {
        console.error('Error cargando perfiles:', err);
        this.loading = false;
      }

    });

  }

}