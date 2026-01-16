import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ShopPublicService } from '../../core/services/shop-public.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';



@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-products.component.html',
  styleUrls: ['./shop-products.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(80, [
              animate(
                '400ms cubic-bezier(.25,.8,.25,1)',
                style({ opacity: 1, transform: 'translateY(0)' })
              )
            ])
          ],
          { optional: true }
        )
      ])
    ])
  ]

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
  searchQuery: string | null = null;



  constructor(
    private route: ActivatedRoute,
    private shopPublicService: ShopPublicService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
  ) { }



ngOnInit() {
  this.route.parent!.paramMap.subscribe(params => {
    this.shopSlug = params.get('slug')!;
  });

  this.route.queryParams.subscribe(params => {
    this.searchQuery = params['search'] || null;
    this.page = +params['page'] || 1;

    this.loadProducts();
  });
}


  trackByProductId(index: number, product: any): number {
    return product.productId;
  }
 



loadProducts() {
  this.loading = true;
  this.error = null;

  const request$ = this.searchQuery
    ? this.shopPublicService.searchProductsByShop(
        this.shopSlug,
        this.searchQuery,
        this.page,
        this.pageSize
      )
    : this.shopPublicService.getProductsBySlug(
        this.shopSlug,
        this.page,
        this.pageSize
      );

  request$.subscribe({
    next: res => {
      this.products = res.data ?? res.products ?? [];
      this.totalCount = res.totalCount ?? this.products.length;
      this.loading = false;
    },
    error: () => {
      this.error = 'Failed to load products';
      this.loading = false;
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
  this.router.navigate([], {
    queryParams: {
      page,
      search: this.searchQuery
    },
    queryParamsHandling: 'merge'
  });

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
