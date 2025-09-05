import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {

  productForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private inventoryService: InventoryService,
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
      shopId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.shopId) {
      this.productForm.patchValue({
        shopId: currentUser.shopId
      });
    } else {
      this.errorMessage = 'No shop associated with your account.';
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024;

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
    console.log("Form Submit Clicked ", this.productForm.value);
    this.errorMessage = null;
    this.successMessage = null;

    if (this.productForm.invalid) {
      this.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    // 👇 Backend ke liye FormData create karte hain
    const formData = new FormData();
    formData.append('ProductName', this.productForm.value.productName);
    formData.append('Description', this.productForm.value.description);
    formData.append('Price', this.productForm.value.price.toString());
    formData.append('StockQuantity', this.productForm.value.stockQuantity.toString());
    formData.append('ShopId', this.productForm.value.shopId.toString());
    formData.append('imageUrl', this.productForm.value.imageFile);

    this.inventoryService.addProduct(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log(" Product added", response);
        this.successMessage = 'Product added successfully!';
        this.productForm.reset();
        this.productForm.patchValue({
          shopId: this.authService.currentUserValue?.shopId
        });
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

  hasError(controlName: string, errorType: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control?.hasError(errorType) && (control?.touched || control?.dirty);
  }
}