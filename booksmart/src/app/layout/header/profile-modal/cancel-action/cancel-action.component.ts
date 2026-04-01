import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancel-action.component.html',
  styleUrl: './cancel-action.component.css'
})
export class CancelActionComponent {

  @Output() cancel = new EventEmitter<void>();

  cancelar() {
    this.cancel.emit();
  }

}