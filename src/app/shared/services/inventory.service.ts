import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  
  private baseUrl =    'https://localhost:7058/api/Product';
  
  constructor(private http: HttpClient) { }

  getProductsByShop(shopId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/GetProductsByShop/${shopId}`);
  }

  addProduct(shopId: number, product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}?shopId=${shopId}`, product);
  }

  // updateProduct(product: Product): Observable<Product> {
  //   return this.http.put<Product>(`${this.baseUrl}/${product.id}`, product);
  // }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }



}
