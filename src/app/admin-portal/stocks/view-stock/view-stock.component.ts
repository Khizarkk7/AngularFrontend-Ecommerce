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
    next: (res) => {
      console.log("API Response:", res);  // <-- yahan check karo kya aa raha h
      this.stocks = res;
    },
    error: (err) => {
      console.error("API Error:", err);   // <-- error bhi log karo
      Swal.fire('Error', 'Failed to fetch stocks', 'error');
    }
  });
}


  // Add stock quantity
  addStock(stock: Stock): void {
  Swal.fire({
    title: 'Add Stock',
    input: 'number',
    inputLabel: `Enter quantity to add for ${stock.productName}`,
    inputAttributes: {
      min: '1'
    },
    showCancelButton: true,
    confirmButtonText: 'Add'
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const quantity = parseInt(result.value, 10);

      this.stockService.addQuantity(stock.stockId, quantity).subscribe({
        next: (updatedStock) => {
          stock.quantity = updatedStock.quantity; // backend se updated value lo
          Swal.fire('Success', `Added ${quantity} to stock`, 'success');
        },
        error: () => Swal.fire('Error', 'Failed to add stock', 'error')
      });
    }
  });
}


  // Reduce stock quantity
  reduceStock(stock: Stock): void {
  Swal.fire({
    title: 'Reduce Stock',
    input: 'number',
    inputLabel: `Enter quantity to reduce from ${stock.productName}`,
    inputAttributes: {
      min: '1',
      max: stock.quantity.toString()
    },
    showCancelButton: true,
    confirmButtonText: 'Reduce'
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const quantity = parseInt(result.value, 10);

      if (quantity > stock.quantity) {
        Swal.fire('Error', 'Quantity exceeds available stock', 'error');
        return;
      }

      this.stockService.reduceQuantity(stock.stockId, quantity).subscribe({
        next: (updatedStock) => {
          stock.quantity = updatedStock.quantity;
          Swal.fire('Success', `Reduced ${quantity} from stock`, 'success');
        },
        error: () => Swal.fire('Error', 'Failed to reduce stock', 'error')
      });
    }
  });
}


 viewHistory(stockId: number): void {
  this.stockService.getStockHistory(stockId).subscribe({
    next: (res) => {
      //console.log('Stock History:', res)
      if (!res || res.length === 0) {
        Swal.fire('Info', 'No history found for this stock.', 'info');
        return;
      }

      // build HTML table dynamically
      let tableHtml = `
        <div style="max-height:300px; overflow-y:auto;">
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align:center; border-collapse:collapse;">
          <thead style="background:#f4f4f4;">
            <tr>
              <th>Change Type</th>
              <th>Qty Changed</th>
              <th>Previous</th>
              <th>New</th>
              <th>Changed By</th>
              <th>Changed At</th>
            </tr>
          </thead>
          <tbody>
      `;

      res.forEach(item => {
        tableHtml += `
          <tr>
            <td>${item.changeType}</td>
            <td>${item.quantityChanged}</td>
            <td>${item.previousQuantity}</td>
            <td>${item.newQuantity}</td>
            <td>${item.changedBy}</td>
            <td>${new Date(item.changedAt).toLocaleString()}</td>
          </tr>
        `;
      });

      tableHtml += `
          </tbody>
        </table>
        </div>
      `;

      // show Swal modal
      Swal.fire({
        title: 'Stock History',
        html: tableHtml,
        width: 800,
        showCloseButton: true,
        confirmButtonText: 'Close'
      });
    },
    error: (err) => {
      console.error('Error fetching stock history:', err);
      Swal.fire('Error', 'Failed to fetch stock history', 'error');
    }
  });
}

}
