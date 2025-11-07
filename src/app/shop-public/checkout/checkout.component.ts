import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout.service';
import { CustomSwal } from '../../core/services/custom-swal.service';
import * as L from 'leaflet';
import { ShopPublicService } from '../../core/services/shop-public.service';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates?: Coordinates;
  formatted?: string;
}

interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  address: Address;
  paymentMethod: string;
  notes: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  shopSlug = '';
  shopId!: number; //  dynamically mapping shopId from slug

  checkoutData: CheckoutData = {
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', province: '', postalCode: '' },
    paymentMethod: '',
    notes: ''
  };

  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  discount = 0;
  tax= 0;
  grandTotal = 0;
  promoCode = '';
  appliedPromo = false;

  isPlacingOrder = false;
  showMapModal = false;

  private map!: L.Map;
  private marker!: L.Marker;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private shopService: ShopPublicService
  ) {}

  ngOnInit(): void {
    this.shopSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.loadCartItems();
    this.calculateTotals();
    
    if (this.shopSlug) {
      this.loadShopBySlug();
    }
  }

  ngAfterViewInit(): void {}


    /** Get shopId from slug dynamically */
  private loadShopBySlug(): void {
    this.shopService.getShopBySlug(this.shopSlug).subscribe({
      next: (shop) => {
        this.shopId = shop.shopId;
        console.log(' Shop Loaded:', shop);
        console.log(' Extracted shopId:', this.shopId);
      },
      error: (err) => {
        console.error(' Error fetching shop by slug:', err);
      }
    });
  }

  /** ------------------ CART METHODS ------------------ **/
  loadCartItems(): void {
    const cartKey = `cart-${this.shopSlug}`;
    try {
      this.cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch {
      this.cartItems = [];
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.shippingCost = this.subtotal > 2000 ? 0 : 200;
    this.grandTotal = this.subtotal + this.shippingCost - this.discount;
  }

  applyPromoCode(): void {
    const validPromos = ['WELCOME10', 'SAVE20', 'FIRSTORDER'];
    if (this.promoCode.trim() && !this.appliedPromo) {
      if (validPromos.includes(this.promoCode.toUpperCase())) {
        this.discount = this.subtotal * 0.1;
        this.appliedPromo = true;
        this.calculateTotals();
        CustomSwal.fire({
          icon: 'success',
          title: 'Promo applied!',
          text: 'You’ve got a 10% discount!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        CustomSwal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: 'Please enter a valid promo code.'
        });
      }
    }
  }

  /** ------------------ MAP ------------------ **/
  openMapModal(): void {
    this.showMapModal = true;
    setTimeout(() => this.initLeafletMap(), 300);
  }

  closeMapModal(): void {
    this.showMapModal = false;
    if (this.map) this.map.remove();
  }

  private initLeafletMap(): void {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const defaultCenter: Coordinates = { lat: 31.5204, lng: 74.3587 };
    this.map = L.map(mapEl).setView([defaultCenter.lat, defaultCenter.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([defaultCenter.lat, defaultCenter.lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.checkoutData.address.coordinates = { lat: pos.lat, lng: pos.lng };
    });
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      CustomSwal.fire({ icon: 'warning', title: 'Unsupported', text: 'Your browser does not support location.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        this.map.setView(loc, 13);
        this.marker.setLatLng(loc);
        this.checkoutData.address.coordinates = loc;

        CustomSwal.fire({
          icon: 'success',
          title: 'Location Found!',
          text: 'Your current location has been set.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        CustomSwal.fire({
          icon: 'error',
          title: 'Unable to fetch location',
          text: 'Please allow access or use map manually.'
        });
      }
    );
  }

  confirmLocation(): void {
    const pos = this.marker.getLatLng();
    this.checkoutData.address.coordinates = { lat: pos.lat, lng: pos.lng };
    this.checkoutData.address.formatted = `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(5)}`;
    this.closeMapModal();
  }

  /** ------------------ PLACE ORDER ------------------ **/
  async placeOrder(): Promise<void> {
    const isValid = await this.validateForm();
    if (!isValid) return;

    const confirm = await CustomSwal.fire({
      icon: 'question',
      title: 'Confirm Order',
      text: 'Do you want to place this order?',
      showCancelButton: true,
      confirmButtonText: 'Yes, place order',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    this.isPlacingOrder = true;

    //  Build backend-compatible payload
    const orderPayload = {
      shopId: this.shopId,
      customer: {
        fullName: this.checkoutData.fullName,
        email: this.checkoutData.email,
        phone: this.checkoutData.phone
      },
      shipping: {
        address: this.checkoutData.address.street,
        city: this.checkoutData.address.city,
        province: this.checkoutData.address.province,
        postalCode: this.checkoutData.address.postalCode
      },
      payment: {
        method: this.checkoutData.paymentMethod
      },
      cartItems: this.cartItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price
      }))
    };
  console.log(' Sending order payload to backend:', orderPayload);

    try {
      const res = await this.checkoutService.placeOrder(orderPayload);
      CustomSwal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: `Order #${res.orderId} placed successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      localStorage.removeItem(`cart-${this.shopSlug}`);
      this.router.navigate(['/order-confirmation'], { queryParams: { orderId: res.orderId } });
    } catch (err: any) {
      console.error('Order Error:', err);
      CustomSwal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.error?.message || 'Something went wrong while placing the order.'
      });
    } finally {
      this.isPlacingOrder = false;
    }
  }

  /** ------------------ VALIDATION ------------------ **/
  private async validateForm(): Promise<boolean> {
    const { fullName, email, phone, address } = this.checkoutData;
    if (!fullName || !email || !phone || !address.street || !address.city || !address.province || !address.postalCode) {
      await CustomSwal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.'
      });
      return false;
    }

    if (!this.isValidEmail(email)) {
      await CustomSwal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email.' });
      return false;
    }

    if (!this.isValidPhone(phone)) {
      await CustomSwal.fire({ icon: 'error', title: 'Invalid Phone', text: 'Enter a valid phone number.' });
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
  }
}
