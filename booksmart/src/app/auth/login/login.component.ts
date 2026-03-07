import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {

        console.log('RESPUESTA LOGIN:', res);

        if (res && res.access_token) {
          this.authService.saveToken(res.access_token);
          this.loading = false;
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'No se recibió token válido';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('ERROR COMPLETO:', err);
        console.log('DETALLE BACKEND:', err.error);
        this.errorMessage = 'Correo o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}