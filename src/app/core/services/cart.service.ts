import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  getCartTotal(shopSlug: string): number {
    throw new Error('Method not implemented.');
  }
  getCartCount(shopSlug: string): number {
    throw new Error('Method not implemented.');
  }
  getQuantity(productId: number, shopSlug: string): number {
    throw new Error('Method not implemented.');
  }
  isInCart(productId: number, shopSlug: string): boolean {
    throw new Error('Method not implemented.');
  }
  removeFromCart(productId: number, shopSlug: string) {
    throw new Error('Method not implemented.');
  }
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() { }

  // Example method to add an item to the cart
  addToCart(item: any, shopSlug: string) {
    const currentCart = this.cartSubject.value;
    this.cartSubject.next([...currentCart, item]);
  }
}