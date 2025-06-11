// ======= admin-portal.component.ts ==========
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ShopService } from '../shared/services/shops.service';
import Swal from 'sweetalert2';

declare var bootstrap: any; // For Bootstrap Modal
@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css'
})
export class AdminPortalComponent implements OnInit {
  shops: any[] = [];
  shopForm!: FormGroup;
  isEditMode: boolean = false;
  selectedShopId: number | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private shopService: ShopService
  ) { }

  ngOnInit(): void {
    this.loadShops();
    this.initForm();
  }

  loadShops() {
  this.shopService.getShops().subscribe((data) => {
    this.shops = data.map(shop => ({
      ...shop,
      fullLogoUrl: this.shopService.getFullLogoUrl(shop.logo)  // yahan full URL add ho raha hai
    }));
    console.log(this.shops);
  });
}


  initForm() {
    this.shopForm = this.fb.group({
      shop_name: [''],
      contact_info: [''],
      description: ['']
    });
  }

onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.logoFile = file;

    // Validate file type (optional)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images are allowed.');
      return;
    }

    // Validate file size (optional, e.g. max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert('File size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}


  openCreateShopModal() {
    this.isEditMode = false;
    this.selectedShopId = null;
    this.shopForm.reset();
    this.logoPreview = null;
    const modal = new bootstrap.Modal('#shopModal');
    modal.show();
  }

  openEditShopModal(shop: any) {
    this.isEditMode = true;
    this.selectedShopId = shop.shop_id;
    this.shopForm.patchValue(shop);
    this.logoPreview = shop.logo;
    const modal = new bootstrap.Modal('#shopModal');
    modal.show();
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('ShopName', this.shopForm.value.shop_name);
    formData.append('ContactInfo', this.shopForm.value.contact_info);
    formData.append('Description', this.shopForm.value.description);
    formData.append('CreatorId', '1'); 

    console.log('Submitting form data:', {
      shop_name: this.shopForm.value.shop_name,
      contact_info: this.shopForm.value.contact_info,
      description: this.shopForm.value.description,
      logoFile: this.logoFile,
    });

    if (this.logoFile) {
      formData.append('Logo', this.logoFile);
    }

    if (this.isEditMode && this.selectedShopId) {
      this.shopService.updateShop(this.selectedShopId, formData).subscribe(() => {
        this.loadShops();
        bootstrap.Modal.getInstance(document.getElementById('shopModal')!)?.hide();
      });
    } else {
      this.shopService.createShop(formData).subscribe(() => {
        this.loadShops();
        bootstrap.Modal.getInstance(document.getElementById('shopModal')!)?.hide();
      });
    }
  }

  confirmDelete(shopId: number) {
    this.selectedShopId = shopId;
    const modal = new bootstrap.Modal('#deleteModal');
    modal.show();
  }

  deleteShop() {
    if (this.selectedShopId) {
      this.shopService.deleteShop(this.selectedShopId).subscribe(() => {
        this.loadShops();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')!)?.hide();
      });
    }
  }

  // onLogout() {
  //   this.authService.deleteToken();
  //   this.router.navigateByUrl('/login');
  // }
  onLogout() {
  Swal.fire({
    title: 'Are you sure you want to log out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, log out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.deleteToken();
      this.router.navigateByUrl('/login');
      
      Swal.fire({
        icon: 'success',
        title: 'Logged out!',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}

}