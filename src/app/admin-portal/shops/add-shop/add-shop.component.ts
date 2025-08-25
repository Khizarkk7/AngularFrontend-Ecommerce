import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-shop.component.html',
  styleUrls: ['./add-shop.component.css']
})
export class AddShopComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  shopForm!: FormGroup;
  logoFile: File | null = null;
  isSubmitting = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.shopForm = this.fb.group({
      // Shop Information
      shopName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      contactInfo: ['', [Validators.required, Validators.maxLength(100)]],
      logo: [null, [Validators.required]],
      
      // Admin User Information
      adminFullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      adminConfirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('adminPassword');
    const confirmPassword = control.get('adminConfirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.showError('Invalid file type. Please select a JPG, PNG, or GIF image.');
        input.value = '';
        return;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.showError('File size too large. Maximum size is 5MB.');
        input.value = '';
        return;
      }
      
      this.logoFile = file;
      this.shopForm.patchValue({ logo: file.name });
      this.shopForm.get('logo')?.updateValueAndValidity();
    }
  }

  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.shopForm.get(fieldName);
    return !!field && field.hasError(errorType) && (field.touched || field.dirty);
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.shopForm.controls).forEach(key => {
      this.shopForm.get(key)?.markAsTouched();
    });

    if (this.shopForm.invalid || !this.logoFile) {
      this.showError('Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    this.showLoading('Creating shop and admin account...');

    const formData = this.prepareFormData();
    const currentUser = this.authService.currentUserValue;

    this.http.post('https://localhost:7058/api/Shop/CreateShopWithAdmin', formData).subscribe({
      next: (response: any) => this.handleSuccess(response),
      error: (error: HttpErrorResponse) => this.handleError(error)
    });
  }

  private prepareFormData(): FormData {
    const formData = new FormData();
    const currentUser = this.authService.currentUserValue;

    // Shop data
    formData.append('ShopName', this.shopForm.value.shopName);
    formData.append('Description', this.shopForm.value.description);
    formData.append('ContactInfo', this.shopForm.value.contactInfo);
    if (this.logoFile) {
      formData.append('Logo', this.logoFile);
    }

    // Admin user data
    formData.append('AdminFullName', this.shopForm.value.adminFullName);
    formData.append('AdminEmail', this.shopForm.value.adminEmail);
    formData.append('AdminPassword', this.shopForm.value.adminPassword);
    
    // Creator ID (from authenticated user)
    formData.append('CreatorId', currentUser?.userId?.toString() || '1');

    return formData;
  }

  private handleSuccess(response: any): void {
    this.isSubmitting = false;
    this.shopForm.reset();
    this.logoFile = null;
    
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: response.message || 'Shop and admin account created successfully.',
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/shops']);
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.isSubmitting = false;
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || error.statusText;
    }
    
    this.showError(errorMessage);
  }

  private showLoading(title: string): void {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK'
    });
  }
}