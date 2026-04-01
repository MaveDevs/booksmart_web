import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { LogoutModalComponent } from './logout-modal/logout-modal.component'; // 🔥 IMPORTANTE
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ProfileModalComponent, LogoutModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isOpen = false;
  showModal = false;
  showLogoutModal = false; 

  user: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getUser();
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