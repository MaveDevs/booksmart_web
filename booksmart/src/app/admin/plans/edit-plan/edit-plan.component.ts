import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.css'] 
})
export class EditPlanComponent {

  @Input() planId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1/plans';

  plan: any = {};
  showSuccessCard = false; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get(`${this.apiUrl}/${this.planId}`).subscribe((res) => {
      this.plan = res;
    });
  }

  updatePlan() {
    this.http.patch(`${this.apiUrl}/${this.planId}`, this.plan).subscribe({
      next: () => {
        this.showSuccessCard = true;

        setTimeout(() => {
          this.showSuccessCard = false;
          this.updated.emit();
          this.close.emit();
        }, 1500);
      },
      error: (err) => console.error(err)
    });
  }

  closeModal() {
    this.close.emit();
  }
}