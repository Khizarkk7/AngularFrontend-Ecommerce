import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

interface Shop {
  shopId: number;
  shopName: string;
  description: string;
  contactInfo: string;
  logoPath: string;
  creatorId: number;
}


@Component({
  selector: 'app-edit-shop',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './edit-shop.component.html',
  styleUrl: './edit-shop.component.css'
})
export class EditShopComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  shopForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  selectedLogoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  currentLogoPath: string = '';
  shopId: number = 0;


  private apiUrl = 'https://localhost:7058/api/Shop'
  private baseUrl = 'https://localhost:7058'


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.shopForm = this.fb.group({
      shopId: [0, Validators.required],
      shopName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
      contactInfo: ['', Validators.required],
      logo: [null],
      creatorId: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.shopId = this.route.snapshot.params['id'];
    this.loadShopData();
  }

  loadShopData(): void {
    this.http.get<Shop>(`/api/Shop/GetShopDetails/${this.shopId}`).subscribe({
      next: (shop) => {
        this.shopForm.patchValue({
          shopId: shop.shopId,
          shopName: shop.shopName,
          description: shop.description,
          contactInfo: shop.contactInfo,
          creatorId: shop.creatorId
        });
        
        this.currentLogoPath = shop.logoPath;
        this.logoPreview = shop.logoPath ? 
          `https://localhost:7058/${shop.logoPath}` : 
          'assets/images/default-shop.png';
      },
      error: (error) => {
        Swal.fire('Error', 'Failed to load shop data', 'error');
        this.router.navigate(['/shops']);
      }
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        Swal.fire('Error', 'Please select an image file (JPEG, PNG, GIF)', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'Image must be less than 5MB', 'error');
        return;
      }

      this.selectedLogoFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedLogo(): void {
    this.selectedLogoFile = null;
    this.fileInput.nativeElement.value = '';
    // Revert to original logo preview
    this.logoPreview = this.currentLogoPath ? 
      `https://localhost:7058/${this.currentLogoPath}` : 
      'assets/images/default-shop.png';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.shopForm.get(fieldName);
    return !!field && field.invalid && (field.touched || field.dirty);
  }

  onSubmit(): void {
    if (this.shopForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('ShopId', this.shopForm.value.shopId.toString());
    formData.append('ShopName', this.shopForm.value.shopName);
    formData.append('Description', this.shopForm.value.description);
    formData.append('ContactInfo', this.shopForm.value.contactInfo);
    formData.append('CreatorId', this.shopForm.value.creatorId.toString());
    
    if (this.selectedLogoFile) {
      formData.append('Logo', this.selectedLogoFile);
    }

    this.http.put('https://localhost:7058/api/Shop/EditShop', formData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Shop updated successfully!';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/shops']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMsg = error.error?.message || 'Failed to update shop. Please try again.';
        Swal.fire('Error', errorMsg, 'error');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.shopForm.controls).forEach(key => {
      this.shopForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/shops']);
  }
}
