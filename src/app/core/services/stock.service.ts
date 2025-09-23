import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stock {
  stockId: number;
  productId: number;
  productName: string;
   price: number;
  shopId: number;
  shopName: string;
  quantity: number;
//stockQuantity: number;
  description: string;
  imageUrl: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface StockHistory {
  historyId: number;
  stockId: number;
  productId: number;
  shopId: number;
  changeType: string;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  changedBy: string;
  changedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  //private baseUrl = 'https://localhost:7058/api/Stock';
  private baseUrl= 'https://192.168.70.94:7058/api/Stock'
  //private imageBaseUrl = 'https://localhost:7058/'

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

 getStockHistory(stockId: number): Observable<StockHistory[]> {
    return this.http.get<StockHistory[]>(`${this.baseUrl}/GetStockHistory/${stockId}`);
  }

}
