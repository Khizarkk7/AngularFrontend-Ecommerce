import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Shop {
  shopId: number;
  shopName: string;
  description: string;
  logo: string;
  contactInfo: string;
  slug: string;
}

export interface Product {
  productId: number;
  name: string;
  price: number;
  description: string;
  //finalPrice: number;   // backend calculation
  // discount?: {
  //   type: string;
  //   value: number;
  //   startDate: string;
  //   endDate: string;
  // };
  //averageRating: number;
  //totalReviews: number;
  imageUrl: string;
}
@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {

  //private apiUrl = 'https://localhost:7058/api/Shop';
  private apiUrl= 'https://192.168.70.94:7058/api/Shop'

  constructor(private http: HttpClient) { }

    getShopBySlug(slug: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/public/${slug}`);
  }

   // Products by Shop Slug (with pagination)
  getProductsBySlug(slug: string, page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/${slug}/products?page=${page}&pageSize=${pageSize}`);
  }
}
