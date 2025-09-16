import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService, Stock } from '../../../core/services/stock.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-stock.component.html',
  styleUrls: ['./view-stock.component.scss']
})
export class StockComponent implements OnInit {
  stocks: Stock[] = [];
  shopId!: number;
  errorMessage: string = '';

  constructor(private stockService: StockService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    //this.loadStocks();
    const id = this.authService.getCurrentShopId();
    if (id) {
      this.shopId = id;
      this.loadStocks();
    } else {
      this.errorMessage = 'Unauthorized: Shop ID not found in token';
    }
  }

  // Load all stocks
  loadStocks(): void {
    this.stockService.getStocksByShop(this.shopId).subscribe({
      next: (res) => this.stocks = res,
      error: (err) => Swal.fire('Error', 'Failed to fetch stocks', 'error')
    });

  }

  // Add stock quantity
  addStock(stock: Stock): void {
    const quantity = 1; // Default increment
    Swal.fire({
      title: 'Add Stock',
      text: `Do you want to add ${quantity} to ${stock.productName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockService.addQuantity(stock.stockId, quantity).subscribe({
          next: () => {
            stock.stockQuantity += quantity;
            Swal.fire('Success', 'Stock added successfully', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to add stock', 'error')
        });
      }
    });
  }

  // Reduce stock quantity
  reduceStock(stock: Stock): void {
    if (stock.stockQuantity <= 0) {
      Swal.fire('Warning', 'Stock is already zero', 'warning');
      return;
    }

    const quantity = 1; // Default decrement
    Swal.fire({
      title: 'Reduce Stock',
      text: `Do you want to reduce ${quantity} from ${stock.productName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reduce it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockService.reduceQuantity(stock.stockId, quantity).subscribe({
          next: () => {
            stock.stockQuantity -= quantity;
            Swal.fire('Success', 'Stock reduced successfully', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to reduce stock', 'error')
        });
      }
    });
  }

  // Optional: View stock history (implement backend API first)
  viewHistory(stock: Stock): void {
    Swal.fire('Info', `View history for ${stock.productName} coming soon!`, 'info');
  }
}
