import { Injectable } from '@angular/core';
import { Product } from './shop-public.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  removeFromWishlist(productId: number) {
    throw new Error('Method not implemented.');
  }
  getWishlist(): Product[] {
    throw new Error('Method not implemented.');
  }
  getWishlistCount(): number {
    throw new Error('Method not implemented.');
  }
  isInWishlist(productId: number): boolean {
    throw new Error('Method not implemented.');
  }
  toggleWishlist(product: Product) {
    throw new Error('Method not implemented.');
  }
 
}
