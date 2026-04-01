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
      next: (res: any) => {

        console.log('RESPUESTA LOGIN:', res);

        if (res && res.access_token) {

          this.authService.saveToken(res.access_token);

          this.authService.getCurrentUser().subscribe({
            next: (user: any) => {

              console.log('USUARIO REAL:', user);

              this.authService.setUser(user);

              this.loading = false;

              this.router.navigate(['/dashboard']);
            },
            error: (err: any) => {
              console.error('Error obteniendo usuario:', err);
              this.errorMessage = 'Error al obtener usuario';
              this.loading = false;
            }
          });

        } else {
          this.errorMessage = 'No se recibió token válido';
          this.loading = false;
        }
      },

      error: (err: any) => {
        console.error('ERROR COMPLETO:', err);
        this.errorMessage = 'Correo o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}