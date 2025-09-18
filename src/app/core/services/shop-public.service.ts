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

@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {

  private apiUrl = 'https://localhost:7058/api/Shop';

  constructor(private http: HttpClient) { }

    getShopBySlug(slug: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/public/${slug}`);
  }
}
