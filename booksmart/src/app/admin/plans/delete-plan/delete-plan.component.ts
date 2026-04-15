import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-plan.component.html',
  styleUrls: ['./delete-plan.component.css']
})
export class DeletePlanComponent {

  @Input() planId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = environment.apiUrl + '/plans';

  loading = false;
  showSuccessCard = false;

  constructor(private http: HttpClient) {}

  deletePlan() {
    this.loading = true;

    this.http.delete(`${this.apiUrl}/${this.planId}`).subscribe({
      next: () => {
        this.showSuccessCard = true;
        this.loading = false;

        setTimeout(() => {
          this.showSuccessCard = false;
          this.deleted.emit();
          this.close.emit();
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  closeModal() {
    if (!this.loading) {
      this.close.emit();
    }
  }
}