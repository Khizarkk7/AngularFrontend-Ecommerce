import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

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
  isSubmitted: boolean = false;

  isLoading: boolean = false;

  private apiUrl = 'https://localhost:7058/api';

  constructor(private fb: FormBuilder, private http: HttpClient,
               private service: AuthService,
             ) { }

  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      shopId: ['', Validators.required]
    });

    this.loadDropdownData();
  }

  loadDropdownData() {
    this.isLoading = true;

    this.service.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.isLoading = false;
        console.log('Roles loaded:', this.roles);
      },
      error: (err: any) => {
        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load roles. Please try again later.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });

    // Fetch shops from your service
    this.service.getShops().subscribe({
      next: (res: any) => {
        this.shops = res;
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load shops. Please try again later.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
        this.isLoading = false;
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
