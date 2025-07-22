import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-shops-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './all-shops-table.component.html',
  styleUrl: './all-shops-table.component.css'
})
export class AllShopsTableComponent {
  @Input() shops: any[] = [];
  @Output() createShop = new EventEmitter<void>();
  @Output() editShop = new EventEmitter<any>();
  @Output() deleteShop = new EventEmitter<number>();

  @Input() isEditMode: boolean = false;
  @Input() shopForm!: FormGroup;
  @Input() logoPreview: string | ArrayBuffer | null = null;
  @Input() logoFile: File | null = null;

  @Output() fileChange = new EventEmitter<any>();
  @Output() submitShop = new EventEmitter<void>();

  pageSize = 6;
  currentPage = 1;

  get paginatedShops() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.shops.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.shops.length / this.pageSize) || 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openCreateShopModal() {
    this.createShop.emit();
  }

  openEditShopModal(shop: any) {
    this.editShop.emit(shop);
  }

  confirmDelete(shopId: number) {
    this.deleteShop.emit(shopId);
  }

  onFileChange(event: any) {
    this.fileChange.emit(event);
  }

  onSubmit() {
    this.submitShop.emit();
  }
} 