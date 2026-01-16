import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';


export interface Shop {
  shopId: number;
  shopName: string;
  description: string;
  logo: string;
  contactInfo: string;
  slug: string;
}

export interface Product {
discount: any;
originalPrice: number;
reviewCount: any;
rating: number;
  productId: number;
  name: string;
  price: number;
  description: string;
  //finalPrice: number;   // backend calculation
  // discount?: {
  //   type: string;
  //   value: number;
  //   startDate: string;
  //   endDate: string;
  // };
  //averageRating: number;
  //totalReviews: number;
  imageUrl: string;
}
@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {

  //private apiUrl = 'https://localhost:7058/api/Shop';
  private apiUrl = 'https://192.168.70.94:7058/api/Shop'
  private baseUrl = 'https://192.168.70.94:7058/api/Product'


  constructor(private http: HttpClient) {}

 // ---------------- CART ----------------
  private cartKey(slug: string) {
    return `cart-${slug}`;
  }

  getCart(slug: string): any[] {
    return JSON.parse(localStorage.getItem(this.cartKey(slug)) || '[]');
  }

  addToCart(slug: string, product: any) {
    const cart = this.getCart(slug);
    const item = cart.find(p => p.productId === product.productId);

    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem(this.cartKey(slug), JSON.stringify(cart));
  }

  updateCart(slug: string, cart: any[]) {
    localStorage.setItem(this.cartKey(slug), JSON.stringify(cart));
  }

  clearCart(slug: string) {
    localStorage.removeItem(this.cartKey(slug));
  }

  // ---------------- WISHLIST ----------------
  private wishlist: Product[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
  private wishlist$ = new BehaviorSubject<Product[]>(this.wishlist);
  wishlistObs$ = this.wishlist$.asObservable();

  toggleWishlist(product: Product) {
    const i = this.wishlist.findIndex(p => p.productId === product.productId);
    i > -1 ? this.wishlist.splice(i, 1) : this.wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    this.wishlist$.next([...this.wishlist]);
  }

  isInWishlist(id: number) {
    return this.wishlist.some(p => p.productId === id);
  }

  // ---------------- API ----------------
  getShopBySlug(slug: string): Observable<Shop> {
  //console.log('📡 Service called with slug:', slug);

  return this.http
    .get<Shop>(`${this.apiUrl}/public/${slug}`)
    .pipe(
      tap(res => {
        //console.log('📡 RAW API response:', res);
        //console.log('📡 res.shopId:', (res as any)?.shopId);
        
      })
    );
}

  getProductsBySlug(slug: string, page = 1, size = 9) {
    return this.http.get<any>(
      `${this.apiUrl}/public/${slug}/products?page=${page}&pageSize=${size}`
    );
  }


searchProductsByShop(
  slug: string,
  query: string,
  page: number = 1,
  size: number = 9
): Observable<any> {

  return this.http.get<any>(
    `${this.baseUrl}/shops/${slug}/products/search`,
    {
      params: {
        q: query,
        page,
        pageSize: size
      }
    }
  );
}










}
