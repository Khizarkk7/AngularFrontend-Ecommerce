import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  isSubmitted: boolean = false;
  roles: any[] = [];
  shops: any[] = [];
  isLoading: boolean = false;


  constructor(
    public formBuilder: FormBuilder,
    private service: AuthService,
    //private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: [
          '',
          [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)],
        ],
        role: ['', Validators.required],
        shop: ['', Validators.required],
        password: [
          '',
          [Validators.required, Validators.maxLength(12), Validators.minLength(6), Validators.pattern(/(?=.*[^a-zA-Z0-9])/)],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.service.isLogedIn()) {
      this.router.navigateByUrl('/users/add');
    }
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.isLoading = true;

    this.service.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.isLoading = false;
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
    this.isSubmitted = true;

    if (this.form.valid) {
      const payload = {
        username: this.form.value.fullName,
        email: this.form.value.email,
        password: this.form.value.password,
        roleId: this.form.value.role,
        shopId: this.form.value.shop
      };
      // Show loading alert
      Swal.fire({
        title: 'Sending...',
        text: 'Please wait while we are fetching your data.',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        showConfirmButton: false
      });

      this.service.createUser(payload).subscribe({
        next: (res: any) => {
          console.log('API Response:', res);

          if (res.succeeded) {
            this.form.reset();
            this.isSubmitted = false;

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: res.message,
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          } else {
            console.log('API Error Response:', res);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: res.message || 'An error occurred!',
              toast: true,
              position: 'top-end'
            });

            if (res.errors) {
              res.errors.forEach((err: string) => {
                console.error('Error:', err);
              });
            }
          }
        },

        error: (err) => {
          console.error('HTTP Error:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while connecting to the server. (Duplicate Entry)',
            toast: true,
            position: 'top-end'
          });
        }
      });
    }
  }


  hasDisplayError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}