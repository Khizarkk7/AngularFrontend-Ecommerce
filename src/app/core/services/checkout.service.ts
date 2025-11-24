import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';

export interface OrderRequest {
  shopId: number;
  customer: CustomerDto;
  shipping: ShippingDto;
  payment: PaymentDto;
  cartItems: CartItemDto[];
}

export interface CustomerDto {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingDto {
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface PaymentDto {
  method: string;
}

export interface CartItemDto {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
  requiresPayment: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiUrl = 'https://192.168.70.94:7058/api/Order';

  constructor(private http: HttpClient) {}

 createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/CreateOrder`, order);
  }

  getOrder(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetOrder/${orderId}`);
  }

  updateOrderStatus(orderId: number, statusData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/UpdateStatus/${orderId}`, statusData);
  }

  cancelOrder(orderId: number, cancelData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/CancelOrder/${orderId}`, cancelData);
  }
}