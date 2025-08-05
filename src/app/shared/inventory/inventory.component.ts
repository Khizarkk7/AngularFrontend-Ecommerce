import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgbDropdownModule, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { InventoryService } from '../../core/services/inventory.service';

interface Product {
  productId: number;
  productName: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
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
  pageSize = 10;
  selectedProduct: Product | null = null;
  newProduct: Partial<Product> = this.getEmptyProduct();

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.shopId = +params['shopId'];
      this.shopName = params['shopName'];
      this.loadProducts();
    });
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
      error: (err:any) => {
        this.handleError('Failed to load products', err);
      }
    });
  }

  // CRUD Operations
  addProduct(): void {
    // if (this.validateProductForm()) {
    //   this.isLoading = true;
    //   const productToAdd = {
    //     ...this.newProduct,
    //     shopId: this.shopId
    //   } as Product;
      
    //   this.inventoryService.addProduct(productToAdd).subscribe({
    //     next: (product: Product) => {
    //       this.products = [...this.products, {
    //         ...product,
    //         status: this.calculateStatus(product.stockQuantity),
    //         createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
    //       }];
    //       this.showSuccess('Product added successfully');
    //       this.resetForm();
    //     },
    //     error: (err) => this.handleError('Failed to add product', err)
    //   });
    // }
  }

  updateProduct(): void {
    // if (this.selectedProduct && this.validateProductForm()) {
    //   this.isLoading = true;
    //   const updatedProduct = {
    //     ...this.selectedProduct,
    //     ...this.newProduct,
    //     productId: this.selectedProduct.productId
    //   } as Product;
      
    //   this.inventoryService.updateProduct(updatedProduct).subscribe({
    //     next: (product: Product) => {
    //       this.products = this.products.map(p => 
    //         p.productId === product.productId ? {
    //           ...product,
    //           status: this.calculateStatus(product.stockQuantity),
    //           createdAt: p.createdAt // Preserve original created date
    //         } : p
    //       );
    //       this.showSuccess('Product updated successfully');
    //       this.resetForm();
    //     },
    //     error: (err) => this.handleError('Failed to update product', err)
    //   });
    // }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this.inventoryService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.productId !== id);
          this.showSuccess('Product deleted successfully');
        },
        error: (err) => this.handleError('Failed to delete product', err)
      });
    }
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
      imageUrl: null
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