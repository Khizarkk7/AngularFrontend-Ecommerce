import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  addUserForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  roles: any[] = [];
  shops: any[] = [];
  isLoadingRoles = true;
  isLoadingShops = true;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      shopId: ['', Validators.required]
    });

    this.loadRoles();
    this.loadShops();
  }

  loadRoles() {
    this.http.get<any[]>('https://your-api-url.com/GetRoles').subscribe({
      next: (data) => {
        this.roles = data;
        this.isLoadingRoles = false;
      },
      error: () => {
        this.errorMessage = ' Failed to load roles.';
        this.isLoadingRoles = false;
      }
    });
  }

  loadShops() {
    this.http.get<any[]>('https://your-api-url.com/GetShops').subscribe({
      next: (data) => {
        this.shops = data;
        this.isLoadingShops = false;
      },
      error: () => {
        this.errorMessage = ' Failed to load shops.';
        this.isLoadingShops = false;
      }
    });
  }

  onSubmit() {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('https://your-api-url.com/AddUser', this.addUserForm.value).subscribe({
      next: () => {
        this.successMessage = ' User added successfully!';
        this.isSubmitting = false;
        this.addUserForm.reset();
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = ' This email is already in use.';
        } else {
          this.errorMessage = ' Failed to add user. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }
}
