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
  shopId: number;
  shopName: string;
  description: string;
  contactInfo: string;
  logo: string;
  createdAt: string;
  creatorName: string;
  fullLogoUrl: string;
}


@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private baseUrl =    'https://localhost:7058/api/Shop';
  private uploadsUrl = 'https://localhost:7058/'; // image uploads base URL

  constructor(private http: HttpClient) { }

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.baseUrl}/GetAllShops`);
  }
  //Helper function to get full logo URL from filename
  getFullLogoUrl(fileName: string): string {
    return this.uploadsUrl + fileName;
  }
  



  createShop(shop: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateShop`, shop);
  }

  updateShop(id: number, shop: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/EditShop`, shop);
  }

  deleteShop(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  
}
