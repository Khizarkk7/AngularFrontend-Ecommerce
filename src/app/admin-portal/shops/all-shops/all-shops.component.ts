import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { routes } from '../../../app.routes';
import { Router } from '@angular/router';
@Component({
  selector: 'app-all-shops',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-shops.component.html',
  styleUrl: './all-shops.component.css'
})
export class AllShopsComponent implements OnInit {
  shops: any[] = [];
  paginatedShops: any[] = [];
  
  loading = true;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  private apiUrl = 'https://localhost:7058/api/Shop'
  private baseUrl = 'https://localhost:7058'

  constructor(private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/GetAllShops`)
      .subscribe({
        next: (data) => {
          this.shops = data.map(shop => ({
            ...shop,
            fullLogoUrl: shop.logo
              ? `${this.baseUrl}/${shop.logo}`
              : null
          }));
          this.totalPages = Math.ceil(this.shops.length / this.pageSize);
          this.setPaginatedData();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load shops.';
          this.loading = false;
        }
      });
  }

  setPaginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedShops = this.shops.slice(startIndex, endIndex);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPaginatedData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPaginatedData();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.setPaginatedData();
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedShops = this.shops.slice(start, end);
  }
   changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }


 //  Redirect to edit page 
  editShop(shop: any) {
    this.router.navigate(['/app-admin/shops/edit', shop.shopId]);
  }

navigateToAddUser(){
  this.router.navigate(['/app-admin/shops/add']);
}
navigateToAddShop(){}


  confirmDelete(shopId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this shop!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#FF6B6B',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteShop(shopId);
      }
    });
  }

  deleteShop(shopId: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this shop?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#FF6B6B',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete(`${this.apiUrl}/${shopId}`)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The shop has been deleted.',
              timer: 1500,
              showConfirmButton: false
            });
            this.shops = this.shops.filter(s => s.shopId !== shopId);
            this.totalPages = Math.ceil(this.shops.length / this.pageSize);
            if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
            this.setPaginatedData();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete shop.',
            });
            console.error(err);
          }
        });
    }
  });
}

}