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
  private baseUrl =    'https://localhost:7058/api/Shop';
  private uploadsUrl = 'http://localhost:7058/uploads/'; // image uploads base URL

  constructor(private http: HttpClient) { }

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.baseUrl}/GetAllShops`);
  }
  // Helper function to get full logo URL from filename
  getFullLogoUrl(fileName: string): string {
    return this.uploadsUrl + fileName;
  }
  createShop(shop: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateShop`, shop);
  }

  updateShop(id: number, shop: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, shop);
  }

  deleteShop(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  
}
