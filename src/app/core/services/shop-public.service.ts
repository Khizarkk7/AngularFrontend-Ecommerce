import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


export interface Shop {
  shopId: number;
  shopName: string;
  description: string;
  logo: string;
  contactInfo: string;
  slug: string;
}

export interface Product {
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

  private wishlist: Product[] = [];
  private wishlistSubject = new BehaviorSubject<Product[]>(this.wishlist);

  wishlist$ = this.wishlistSubject.asObservable()


  constructor(private http: HttpClient) {

    const savedWishlist = localStorage.getItem('wishlist');
  if (savedWishlist) {
    this.wishlist = JSON.parse(savedWishlist);
  }

  this.wishlistSubject.next([...this.wishlist]);

  }

  getShopBySlug(slug: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/public/${slug}`);
  }

  // Products by Shop Slug (with pagination)
  getProductsBySlug(slug: string, page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/${slug}/products?page=${page}&pageSize=${pageSize}`);
  }


  // Wishlist Functions
  getWishlist(): Product[] {
    return this.wishlist;
  }

toggleWishlist(product: Product): void {
  const index = this.wishlist.findIndex(p => p.productId === product.productId);

  if (index > -1) {
    this.wishlist.splice(index, 1); // remove
  } else {
    this.wishlist.push(product); // add
  }

  this.saveWishlist();
  this.wishlistSubject.next([...this.wishlist]); // notify subscribers
}


  isInWishlist(productId: number): boolean {
    return this.wishlist.some(p => p.productId === productId);
  }

  private saveWishlist(): void {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }
}
