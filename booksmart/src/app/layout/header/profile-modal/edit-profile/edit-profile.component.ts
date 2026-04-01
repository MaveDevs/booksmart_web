import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  @Output() save = new EventEmitter<any>();

  editableUser: any = {};

  constructor(private authService: AuthService) {}

  @Input() set user(value: any) {
    if (value) {
      this.editableUser = { ...value };
      console.log('USER RECIBIDO:', this.editableUser); 
    }
  }

  saveChanges() {

    console.log('CLICK GUARDAR');

    const userId = this.editableUser.usuario_id;
    console.log('USER ID:', userId);

    if (!userId) {
      console.error(' No hay usuario_id');
      return;
    }

    const data = {
      nombre: this.editableUser.nombre,
      correo: this.editableUser.correo
    };

    console.log('DATA A ENVIAR:', data);

    this.authService.updateUser(userId, data).subscribe({
      next: (response: any) => {
        console.log(' SUCCESS:', response);
        this.save.emit(response);
      },
      error: (err: any) => {
        console.error(' ERROR BACKEND:', err);
      }
    });
  }
}