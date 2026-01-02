import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private wishlistSubject = new BehaviorSubject<any[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  private currentShopSlug!: string;

  /* ------------ SHOP CONTEXT ------------ */

  setShop(slug: string) {
    this.currentShopSlug = slug;
    const saved = this.loadFromStorage();
    this.wishlistSubject.next(saved);
  }

  private getKey(): string {
    return `wishlist-${this.currentShopSlug}`;
  }

  /* ------------ WISHLIST LOGIC ------------ */

  toggleWishlist(product: any) {
    const list = [...this.wishlistSubject.value];
    const index = list.findIndex(p => p.productId === product.productId);

    if (index > -1) {
      list.splice(index, 1); // remove
    } else {
      list.push(product); // add
    }

    this.update(list);
  }

  remove(productId: number) {
    const list = this.wishlistSubject.value.filter(
      p => p.productId !== productId
    );
    this.update(list);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.value.some(
      p => p.productId === productId
    );
  }

  /* ------------ STORAGE ------------ */

  private update(list: any[]) {
    this.wishlistSubject.next(list);
    localStorage.setItem(this.getKey(), JSON.stringify(list));
  }

  private loadFromStorage(): any[] {
    const data = localStorage.getItem(this.getKey());
    return data ? JSON.parse(data) : [];
  }
}
