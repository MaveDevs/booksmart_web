import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api/v1';

  private currentUser: any = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login/access-token`, {
      email,
      password
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/me`);
  }

  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('access_token', token);
    }
  }

  getToken() {
    if (this.isBrowser) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setUser(user: any) {
    this.currentUser = user;

    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    return this.currentUser;
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/users/${userId}`,
      data
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.clear(); 
    }

    this.currentUser = null;

    this.router.navigate(['/login']);
  }
}