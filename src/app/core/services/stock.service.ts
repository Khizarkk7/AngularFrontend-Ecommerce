import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stock {
  stockId: number;
  productId: number;
  productName: string;
  shopId: number;
  shopName: string;
  quantity: number;
  stockQuantity: number;
  price: number;
  description: string;
  imageUrl: string;
  lastUpdated: Date;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'https://localhost:7058/api/Stock';

  constructor(private http: HttpClient) { }


  getStocksByShop(shopId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.baseUrl}/GetStockByShop/${shopId}`);
  }

  addQuantity(stockId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddQuantity`, { stockId, quantity });
  }

  reduceQuantity(stockId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/ReduceQuantity`, { stockId, quantity });
  }
}
