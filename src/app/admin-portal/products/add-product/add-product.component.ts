import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  // Font Awesome icons
  // faCube = faCube;
  // faInfoCircle = faInfoCircle;
  // faSave = faSave;

  productForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize the form with validation rules
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      imageFile: [null, Validators.required],
      stockQuantity: [null, [Validators.required, Validators.min(0)]],
      shopId: [null, Validators.required] // Will be set from auth token
    });
  }

  ngOnInit(): void {
    // Get shop ID from authenticated user
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.shopId) {
      this.productForm.patchValue({
        shopId: currentUser.shopId
      });
    } else {
      this.errorMessage = 'No shop associated with your account.';
      // In a real app, you might want to redirect to a different page
      
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Basic client-side validation
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Only JPG and PNG images are allowed.';
        return;
      }
      
      if (file.size > maxSize) {
        this.errorMessage = 'Image size must be less than 5MB.';
        return;
      }

      this.productForm.patchValue({
        imageFile: file
      });
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    // Reset messages
    this.errorMessage = null;
    this.successMessage = null;

    // Check form validity
    if (this.productForm.invalid) {
      this.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('productName', this.productForm.value.productName);
    formData.append('description', this.productForm.value.description);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('stockQuantity', this.productForm.value.stockQuantity.toString());
    formData.append('shopId', this.productForm.value.shopId.toString());
    formData.append('imageFile', this.productForm.value.imageFile);

    // Replace with your actual API endpoint
    this.http.post('https://your-api.com/products', formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Product added successfully!';
        this.productForm.reset();
        // Reset shopId after form reset
        this.productForm.patchValue({
          shopId: this.authService.currentUserValue?.shopId
        });
        // Optional: Redirect after success
        setTimeout(() => this.router.navigate(['/products']), 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to add product. Please try again.';
        console.error('Error adding product:', error);
      }
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Helper method to check if a field has errors
  hasError(controlName: string, errorType: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control?.hasError(errorType) && (control?.touched || control?.dirty);
  }
}