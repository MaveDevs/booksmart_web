import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { LogoutModalComponent } from './logout-modal/logout-modal.component'; 
import { NotificationsComponent } from './notifications/notifications.component';
import { AuthService } from '../../services/auth.service';
import { ApiConfigService } from '../../services/api-config.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ProfileModalComponent,
    LogoutModalComponent,
    NotificationsComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isOpen = false;
  showModal = false;
  showLogoutModal = false;

  user: any = {};

  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor(
    private authService: AuthService,
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadNotifications();
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

  loadNotifications() {
    this.http.get<any[]>(this.apiConfigService.notifications.list, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.notifications = res || [];

        this.unreadCount = this.notifications.filter(n => !n.leida).length;
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  toggleProfile() {
    this.isOpen = !this.isOpen;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isOpen = false;
  }

  updateUser(user: any) {
    this.user = user;
    this.authService.setUser(user);
  }

  logout() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.authService.logout();
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }
}