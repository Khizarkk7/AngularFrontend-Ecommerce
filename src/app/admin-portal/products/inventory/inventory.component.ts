import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownModule, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { CustomSwal } from '../../../core/services/custom-swal.service';

interface Product {
  productId: number;
  productName: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  imageFile?: File;
  stockQuantity?: number | null;
  shopId: number;
  createdAt?: Date | null;
  status?: string; // Calculated field
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbPaginationModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  public Math = Math;
  products: Product[] = []; // Properly typed Product array
  shopId!: number;
  shopName!: string;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // UI Controls
  searchTerm = '';
  page = 1;
  pageSize = 4;
  selectedProduct: Product | null = null;
  newProduct: Partial<Product> = this.getEmptyProduct();

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    //  ShopId directly from token
    const id = this.authService.getCurrentShopId();
    if (id) {
      this.shopId = id;
      this.loadProducts();
    } else {
      this.errorMessage = 'Unauthorized: Shop ID not found in token';
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getProductsByShop(this.shopId).subscribe({
      next: (products: Product[]) => {
        this.products = products.map(p => ({
          ...p,
          status: this.calculateStatus(p.stockQuantity),
          createdAt: p.createdAt ? new Date(p.createdAt) : null
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        this.handleError('Failed to load products', err);
      }
    });
  }

  // CRUD Operations
  addProduct() {
    this.router.navigate(['/app-admin/shops', this.shopId, 'products', 'add']);
  }

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newProduct.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(this.newProduct.imageFile!);
    }
  }




updateProduct() {
 if (!this.selectedProduct) return;

  const formData = new FormData();

  // Required fields
  formData.append('ProductName', this.newProduct.productName || '');
  formData.append('Price', (this.newProduct.price ?? 0).toString());
  formData.append('StockQuantity', (this.newProduct.stockQuantity ?? 0).toString());
  formData.append('ShopId', this.authService.getCurrentShopId()?.toString() || '0');

  // Optional fields (append only if present)
  if (this.newProduct.description) {
    formData.append('Description', this.newProduct.description);
  }

  if (this.newProduct.imageFile instanceof File) {
    formData.append('imageUrl', this.newProduct.imageFile);
  }

  this.inventoryService.editProduct(this.selectedProduct.productId, formData).subscribe({
    next: (res) => {
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Product updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });

      //  Refresh product list after update
      this.loadProducts();

      //  Reset modal state
      this.selectedProduct = null;
      this.newProduct = {};
      this.previewUrl = null;
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.error?.message || 'Failed to update product.'
      });
    }
  });
}

deleteProduct(id: number): void {
  CustomSwal.fire({
    title: 'Are you sure?',
    text: 'This action will permanently delete the product!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.inventoryService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.productId !== id);
          CustomSwal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Product deleted successfully',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          CustomSwal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete product',
          });
          this.handleError('Failed to delete product', err);
        }
      });
    }
  });
}


  // Helper Methods
  private calculateStatus(stockQuantity?: number | null): string {
    if (stockQuantity === null || stockQuantity === undefined || stockQuantity <= 0) {
      return 'Out of Stock';
    }
    if (stockQuantity < 20) return 'Low Stock';
    return 'Active';
  }

  private validateProductForm(): boolean {
    if (!this.newProduct.productName?.trim()) {
      this.errorMessage = 'Product name is required';
      return false;
    }
    if (!this.newProduct.price || this.newProduct.price <= 0) {
      this.errorMessage = 'Valid price is required';
      return false;
    }
    return true;
  }

  private getEmptyProduct(): Partial<Product> {
    return {
      productName: '',
      description: null,
      price: 0,
      stockQuantity: null,
      imageUrl: null,
      imageFile: undefined 
    };
  }

  public resetForm(): void {
    this.newProduct = this.getEmptyProduct();
    this.selectedProduct = null;
    this.isLoading = false;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = error.error?.message || message;
    this.isLoading = false;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
    this.isLoading = false;
  }

  // Computed Properties for Template
  get activeProductsCount(): number {
    return this.products.filter(p => p.status === 'Active').length;
  }

  get lowStockCount(): number {
    return this.products.filter(p => p.status === 'Low Stock').length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => p.status === 'Out of Stock').length;
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.productName.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  }

  get paginatedProducts(): Product[] {
    return this.filteredProducts.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Out of Stock': return 'bg-danger';
      case 'Low Stock': return 'bg-warning text-dark';
      default: return 'bg-success';
    }
  }

  // UI Actions
  openEditModal(product: Product | null): void {
    this.selectedProduct = product;
    this.newProduct = product ? { ...product } : this.getEmptyProduct();
    this.errorMessage = '';
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  }
}