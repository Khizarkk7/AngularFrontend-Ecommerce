// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'https://192.168.70.94:7058/api/Payment';

  constructor(private http: HttpClient) {}

  // initiatePayment(payload: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/PaymentInitiate`, payload);
  // }
  /** INITIATE PAYMENT */
  initiatePayment(payload: {
    orderId: number;
    returnUrl: string;
  }): Observable<{
    success: boolean;
    paymentUrl: string;
    orderId: number;
  }> {
    return this.http.post<any>(
      `${this.apiUrl}/Initiate`,
      payload
    );
  }
}
