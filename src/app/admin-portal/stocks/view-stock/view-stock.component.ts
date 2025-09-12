import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Stock {
  productId: number;
  productName: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  shopId: number;
}
@Component({
  selector: 'app-view-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-stock.component.html',
  styleUrl: './view-stock.component.css'
})
export class ViewStockComponent {

stocks: Stock[] = [];

  ngOnInit(): void {
    // Dummy data, baad me API se call karna hai
    this.stocks = [
      {
        productId: 1,
        productName: 'Desert Boot',
        description: 'Desert boot with dust protection',
        price: 300,
        imageUrl: 'https://placehold.co/600x400/000000/FFFH',
        stockQuantity: 20,
        shopId: 5
      },
      {
        productId: 2,
        productName: 'Running Shoes',
        description: 'Lightweight running shoes',
        price: 150,
        imageUrl: 'https://placehold.co/600x400@2x.png',
        stockQuantity: 5,
        shopId: 5
      },
      {
        productId: 3,
        productName: 'Leather Jacket',
        description: 'Black premium leather jacket',
        price: 500,
        imageUrl: 'https://placehold.co/600x400/png',
        stockQuantity: 0,
        shopId: 5
      }
    ];
  }

viewHistory(_t13: any) {
throw new Error('Method not implemented.');
}
openRemoveStock(_t13: any) {
throw new Error('Method not implemented.');
}
openAddStock(_t13: any) {
throw new Error('Method not implemented.');
}

}
