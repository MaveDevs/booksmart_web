import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-plan.component.html',
  styleUrls: ['./create-plan.component.css'] 
})
export class CreatePlanComponent {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = environment.apiUrl + '/plans';

  plan = {
    nombre: '',
    descripcion: '',
    precio: 0,
    activo: true
  };

  constructor(private http: HttpClient) {}

  createPlan() {
    this.http.post(this.apiUrl, this.plan).subscribe({
      next: () => {
        this.created.emit();
        this.close.emit();
      },
      error: (err) => console.error(err)
    });
  }

  closeModal() {
    this.close.emit();
  }
}