import { Component, OnInit, HostListener } from '@angular/core';
import { Product, ShopPublicService } from '../../core/services/shop-public.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-public.component.html',
  styleUrls: ['./shop-public.component.css']
})
export class ShopPublicComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private shopPublicService: ShopPublicService
  ) { }

  ngOnInit(): void {
    this.loadThemePreference();
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadShopData(slug);
      this.getProducts(slug);
    }
    this.loadCartFromStorage();

    this.shopPublicService.wishlist$.subscribe(list => {
      this.wishlist = list;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  loadShopData(slug: string) {
    this.shopPublicService.getShopBySlug(slug).subscribe({
      next: (shop) => {
        this.shop = shop;
      },
      error: (err) => {
        console.error('Error fetching shop details:', err);
      }
    });
  }

  getProducts(slug: string) {
    this.loading = true;
    this.error = null;

    this.shopPublicService.getProductsBySlug(slug, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.totalCount = res.totalCount || 0;
        this.pageCount = res.pageCount || Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
        console.error('API Error:', err);
      }
    });
  }

  addToCart(product: any) {
    const existingItem = this.cart.find(item => item.productId === product.productId);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.saveCartToStorage();
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.saveCartToStorage();
  }

  updateQuantity(index: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeFromCart(index);
      return;
    }
    this.cart[index].quantity = newQuantity;
    this.saveCartToStorage();
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      const slug = this.route.snapshot.paramMap.get('slug')!;
      this.getProducts(slug);
      this.scrollToTop();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  retryLoading() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.getProducts(slug);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/product-placeholder.png';
  }

  quickView(product: any) {
    // Implement quick view functionality
    console.log('Quick view:', product);
  }

  toggleWishlist(product: Product) {
    this.shopPublicService.toggleWishlist(product);
  }

  isInWishlist(product: Product): boolean {
    return this.shopPublicService.isInWishlist(product.productId);
  }
  toggleWishlistPopup() {
    this.wishlistPopupOpen = !this.wishlistPopupOpen;
  }

  removeFromWishlist(product: Product) {
    this.shopPublicService.toggleWishlist(product);
    this.wishlist = this.shopPublicService.getWishlist();
  }


  private loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  private saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

}