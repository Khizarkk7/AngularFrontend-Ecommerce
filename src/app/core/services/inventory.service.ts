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
  
  //private baseUrl =    'https://localhost:7058/api/Product';
  private baseUrl= 'https://192.168.70.94:7058/api/Product'
  
  constructor(private http: HttpClient) { }

  getProductsByShop(shopId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/GetProductsByShop/${shopId}`);
  }

  addProduct(product: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddProduct`, product);
  }

  //  Edit Product
  editProduct(productId: number, product: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/EditProduct/${productId}`, product);
  }


 deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/SoftDeleteProduct/${productId}`,{ responseType: 'text' });
  }



}
