// ======= admin-portal.component.ts ==========
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ShopService } from '../shared/services/shops.service';


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
      this.shops = data;
      console.log(data);
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
    formData.append('shopName', this.shopForm.value.shopName);
    formData.append('contact_info', this.shopForm.value.contact_info);
    formData.append('description', this.shopForm.value.description);
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
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

  onLogout() {
    this.authService.deleteToken();
    this.router.navigateByUrl('/login');
  }
}