import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CustomSwal } from '../../core/services/custom-swal.service';
import * as L from 'leaflet';

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
  id: number;
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
  tax = 0;
  discount = 0;
  grandTotal = 0;

  promoCode = '';
  appliedPromo = false;

  isPlacingOrder = false;
  showMapModal = false;

  //  Leaflet map variables
  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.shopSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.loadCartItems();
    this.calculateTotals();
  }

  ngAfterViewInit(): void {}

  /** ------------------🛒 CART METHODS ------------------ **/
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
      } else {
        alert('Invalid promo code.');
      }
    }
  }

  /** ------------------  LEAFLET MAP ------------------ **/
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

    this.marker = L.marker([defaultCenter.lat, defaultCenter.lng], {
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.checkoutData.address.coordinates = { lat: pos.lat, lng: pos.lng };
    });
  }

useCurrentLocation(): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        this.map.setView(loc, 13);
        this.marker.setLatLng(loc);
        this.checkoutData.address.coordinates = loc;

        // ✅ Success alert
        CustomSwal.fire({
          icon: 'success',
          title: 'Location Found!',
          text: 'Your current location has been set on the map.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        //  Error alert
        CustomSwal.fire({
          icon: 'error',
          title: 'Unable to get your location',
          text: 'Please allow location access or use the map manually.'
        });

        // Optional fallback location
        const defaultLoc = { lat: 31.5204, lng: 74.3587 }; // Lahore
        this.map.setView(defaultLoc, 13);
        this.marker.setLatLng(defaultLoc);
        this.checkoutData.address.coordinates = defaultLoc;
      }
    );
  } else {
    CustomSwal.fire({
      icon: 'warning',
      title: 'Unsupported',
      text: 'Your browser does not support geolocation.'
    });
  }
}


  confirmLocation(): void {
    const pos = this.marker.getLatLng();
    this.checkoutData.address.coordinates = { lat: pos.lat, lng: pos.lng };
    this.checkoutData.address.formatted = `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(5)}`;
    console.log(' Location confirmed:', this.checkoutData.address);
    this.closeMapModal();
  }

  /** ------------------  PLACE ORDER ------------------ **/
  async placeOrder(): Promise<void> {
    const isValid = await this.validateForm();
    if (!isValid) return;

    const result = await CustomSwal.fire({
      icon: 'question',
      title: 'Confirm Order',
      text: 'Are you sure you want to place this order?',
      showCancelButton: true,
      confirmButtonText: 'Yes, place order',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    this.isPlacingOrder = true;

    const orderData = {
      customer: this.checkoutData,
      cartItems: this.cartItems,
      totals: {
        subtotal: this.subtotal,
        shippingCost: this.shippingCost,
        tax: this.tax,
        discount: this.discount,
        grandTotal: this.grandTotal
      },
      orderId: this.generateOrderId(),
      date: new Date().toISOString(),
      shopSlug: this.shopSlug
    };

    console.log('🧾 Order Placed:', orderData);

    setTimeout(() => {
      this.isPlacingOrder = false;
      localStorage.removeItem(`cart-${this.shopSlug}`);

      CustomSwal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order has been placed successfully.',
        timer: 2000,
        showConfirmButton: false
      });

      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: orderData.orderId }
      });
    }, 2000);
  }

  private async validateForm(): Promise<boolean> {
    const { fullName, email, phone, address } = this.checkoutData;
    if (!fullName || !email || !phone || !address.street || !address.city || !address.province || !address.postalCode) {
      await CustomSwal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields before proceeding.',
      });
      return false;
    }

    if (!this.isValidEmail(email)) {
      await CustomSwal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return false;
    }

    if (!this.isValidPhone(phone)) {
      await CustomSwal.fire({
        icon: 'error',
        title: 'Invalid Phone',
        text: 'Please enter a valid phone number.',
      });
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

  private generateOrderId(): string {
    return 'ORD-' + Date.now().toString().slice(-8);
  }
}
