import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../core/services/shops.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomSwal } from '../../../core/services/custom-swal.service';

interface Shop {
  shopId: number;
  shopName: string;
  description: string;
  contactInfo: string;
  logo: string;
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


  // private apiUrl = 'https://localhost:7058/api/Shop'
  // private baseUrl = 'https://localhost:7058'


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private shopService: ShopService,
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

  //  Load Shop Data from API (via Service)
  loadShopData(): void {
    this.shopService.getShopDetails(this.shopId).subscribe({
      next: (shop: Shop) => {
        this.shopForm.patchValue({
          shopId: shop.shopId,
          shopName: shop.shopName,
          description: shop.description,
          contactInfo: shop.contactInfo,
          creatorId: shop.creatorId
        });

        this.currentLogoPath = shop.logo;
        this.logoPreview = shop.logo
          ? `https://localhost:7058/${shop.logo}`
          : 'assets/images/default-shop.png';
      },
      error: () => {
        Swal.fire('Error', 'Failed to load shop data', 'error');
        this.router.navigate(['/app-admin/shops/view']);
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
    console.log("Submit button clicked ");
    if (this.shopForm.invalid) {
      console.log("Form Invalid ", this.shopForm.value);
      this.markFormGroupTouched();
      return;
    }


    CustomSwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to update this shop?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {

        this.isSubmitting = true;

        const shopData = new FormData();
        shopData.append('ShopId', this.shopForm.value.shopId.toString());
        shopData.append('ShopName', this.shopForm.value.shopName);
        shopData.append('Description', this.shopForm.value.description || '');
        shopData.append('ContactInfo', this.shopForm.value.contactInfo || '');
        shopData.append('CreatorId', this.shopForm.value.creatorId.toString());

        if (this.selectedLogoFile) {
          shopData.append('Logo', this.selectedLogoFile, this.selectedLogoFile.name);
        }
        // CreatedAt bhejo (agar API me required hai)
        shopData.append('CreatedAt', new Date().toISOString());


        console.log('Submitting shopData:', shopData);

        this.shopService.editShop(shopData).subscribe({
          next: (response: any) => {
            console.log(" Shop updated:", response);
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: response.message || 'Shop updated successfully!',
              timer: 2000,
              showConfirmButton: false
            });

            this.router.navigate(['/shops']);
          },
          error: (error) => {
            console.error(" Update failed:", error);
            this.isSubmitting = false;
            const errorMsg =
              error.error?.message || 'Failed to update shop. Please try again.';
            Swal.fire('Error', errorMsg, 'error');
          }
        });
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.shopForm.controls).forEach((key) => {
      this.shopForm.get(key)?.markAsTouched();
    });
  }


  goBack(): void {
    this.router.navigate(['/app-admin/shops/view']);
  }
}
