// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ShopsService {

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shop {
  shop_id: number;
  shop_name: string;
  description: string;
  contact_info: string;
  logo: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private baseUrl = 'https://localhost:7058/api/Shop'; 

  constructor(private http: HttpClient) {}

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.baseUrl}/GetAllShops`);
  }

  createShop(shop: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}`, shop);
  }

  updateShop(id: number, shop: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, shop);
  }

  deleteShop(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
