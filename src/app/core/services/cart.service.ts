import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  shopId?: number; // optional if needed
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  /* ---------------- STATE ---------------- */
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  private cartOpenSubject = new BehaviorSubject<boolean>(false);
  cartOpen$ = this.cartOpenSubject.asObservable();

  private currentShopSlug!: string;

  /* ---------------- SHOP CONTEXT ---------------- */
  setShop(slug: string) {
    this.currentShopSlug = slug;
    const savedCart = this.loadFromStorage();
    this.cartSubject.next(savedCart);
  }

  private getKey(): string {
    if (!this.currentShopSlug) throw new Error("Shop slug not set for cart");
    return `cart-${this.currentShopSlug}`;
  }

  /* ---------------- CART UI ---------------- */
  toggleCart() {
    this.cartOpenSubject.next(!this.cartOpenSubject.value);
  }

  openCart() {
    this.cartOpenSubject.next(true);
  }

  closeCart() {
    this.cartOpenSubject.next(false);
  }

  /* ---------------- CART LOGIC ---------------- */
  addToCart(product: CartItem) {
    const cart = [...this.cartSubject.value];
    const existing = cart.find(item => item.productId === product.productId);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    this.updateCart(cart);
  }

  updateQuantity(productId: number, qty: number) {
    const cart = [...this.cartSubject.value];
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    if (qty < 1) {
      const index = cart.indexOf(item);
      cart.splice(index, 1);
    } else {
      item.quantity = qty;
    }

    this.updateCart(cart);
  }

  removeItem(productId: number) {
    const cart = this.cartSubject.value.filter(i => i.productId !== productId);
    this.updateCart(cart);
  }

  clearCart() {
    this.updateCart([]);
  }

  getTotal(): number {
    return this.cartSubject.value.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  getTotalItems(): number {
    return this.cartSubject.value.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );
  }

  /* ---------------- STORAGE ---------------- */
  private updateCart(cart: CartItem[]) {
    this.cartSubject.next(cart);
    try {
      localStorage.setItem(this.getKey(), JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.getKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /* ---------------- CHECKOUT HELPER ---------------- */
  getCartSnapshot(): CartItem[] {
    // Return current cart value for checkout
    return [...this.cartSubject.value];
  }
}
