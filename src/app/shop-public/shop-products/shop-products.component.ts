import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ShopPublicService } from '../../core/services/shop-public.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-products.component.html',
  styleUrls: ['./shop-products.component.css']
})
export class ShopProductsComponent implements OnInit {
  shop: any;
  products: any[] = [];
  cart: any[] = [];
  cartOpen: boolean = false;
  page: number = 1;
  pageSize: number = 9;
    loading: boolean = false;
    error: string | null = null;
  totalCount: number = 0;
  pageCount: number = 0;
  isDarkMode: boolean = false;
  showBackToTop: boolean = false;
  wishlist: Product[] = [];
  wishlistPopupOpen = false;
  shopSlug!: string;



  constructor(
    private route: ActivatedRoute,
    private shopPublicService: ShopPublicService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
  ) { }
 

  ngOnInit(): void {
    this.shopSlug = this.route.parent?.snapshot.paramMap.get('slug')!;
    this.getProducts();
  }

  getProducts(): void {
    this.loading = true;

    this.shopPublicService.getProductsBySlug(this.shopSlug, this.page, this.pageSize)
      .subscribe({
        next: res => {
          this.products = res.products || [];
          this.totalCount = res.totalCount || 0;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load products';
          this.loading = false;
          console.error(err);
        }
      });
  }

addToCart(product: any) {
  this.cartService.addToCart(product);
  this.cartService.openCart(); //  cart auto open
}


  toggleWishlist(product: Product) {
    this.wishlistService.toggleWishlist(product);
  }

  isInWishlist(product: Product): boolean {
    return this.wishlistService.isInWishlist(product.productId);
  }

  changePage(page: number) {
    this.page = page;
    this.getProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

    public loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart-' + this.shopSlug);
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

    private saveCartToStorage() {
    // Key per shop:
    const cartKey = `cart-${this.shopSlug}`;
    localStorage.setItem(cartKey, JSON.stringify(this.cart));

  }
  
}
