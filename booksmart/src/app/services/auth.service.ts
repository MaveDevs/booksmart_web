import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api/v1/auth/login/access-token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {

    return this.http.post<any>(this.apiUrl, {
      email: email,
      password: password
    });
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}