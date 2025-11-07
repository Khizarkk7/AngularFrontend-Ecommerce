import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiUrl = 'https://192.168.70.94:7058/api/Order/PlaceOrder';

  constructor(private http: HttpClient) {}

  placeOrder(orderData: any): Promise<any> {
    return lastValueFrom(this.http.post(this.apiUrl, orderData));
  }
}
