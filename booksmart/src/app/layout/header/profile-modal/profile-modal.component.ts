import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, EditProfileComponent],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.css'
})
export class ProfileModalComponent {

  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  @Input() user: any;

  view: 'profile' | 'edit' = 'profile';

  closeModal() {
    this.close.emit();
  }

  goToEdit() {
    this.view = 'edit';
  }

  goToProfile() {
    this.view = 'profile';
  }

  updateUser(updatedUser: any) {
    this.user = updatedUser;
    this.userUpdated.emit(updatedUser);
    this.view = 'profile';
  }
}