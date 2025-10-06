import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare const google: any;

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

  // ✅ Form model
  checkoutData: CheckoutData = {
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', province: '', postalCode: '' },
    paymentMethod: 'cod',
    notes: ''
  };

  // ✅ Cart variables
  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  tax = 0;
  discount = 0;
  grandTotal = 0;

  // ✅ Promo
  promoCode = '';
  appliedPromo = false;

  // ✅ Flags
  isPlacingOrder = false;
  showMapModal = false;

  // ✅ Google Maps variables
  private map!: google.maps.Map;
  private marker!: google.maps.Marker;
  private autocomplete!: google.maps.places.Autocomplete;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.calculateTotals();
  }

  ngAfterViewInit(): void {
    // map initializes dynamically when modal opens
  }

  /** ------------------ 🛒 CART METHODS ------------------ **/
  loadCartItems(): void {
    const savedCart = localStorage.getItem('cart');
    this.cartItems = savedCart ? JSON.parse(savedCart) : [];
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.shippingCost = this.subtotal > 2000 ? 0 : 200;
    //this.tax = this.subtotal * 0.16;
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
        alert('❌ Invalid promo code.');
      }
    }
  }

  /** ------------------ 🗺 MAP HANDLING ------------------ **/
  openMapModal(): void {
    this.showMapModal = true;
    setTimeout(() => this.initMap(), 300);
  }

  closeMapModal(): void {
    this.showMapModal = false;
  }

  private initMap(): void {
    const mapEl = document.getElementById('map') as HTMLElement;
    if (!mapEl) return;

    const defaultCenter: Coordinates = { lat: 31.5204, lng: 74.3587 };

    this.map = new google.maps.Map(mapEl, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.marker = new google.maps.Marker({
      position: defaultCenter,
      map: this.map,
      draggable: true,
      title: 'Drag to select your location'
    });

    const input = document.getElementById('locationSearch') as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['geometry', 'formatted_address'],
      types: ['geocode']
    });
    this.autocomplete.bindTo('bounds', this.map);

    // When user selects a location
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const loc = place.geometry.location;
      this.map.setCenter(loc);
      this.marker.setPosition(loc);

      this.checkoutData.address.formatted = place.formatted_address || '';
      this.checkoutData.address.coordinates = { lat: loc.lat(), lng: loc.lng() };
    });

    // Marker drag event
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (pos) this.checkoutData.address.coordinates = { lat: pos.lat(), lng: pos.lng() };
    });
  }

  useCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          this.map.setCenter(loc);
          this.marker.setPosition(loc);
          this.checkoutData.address.coordinates = loc;
        },
        () => alert('Unable to get your location.')
      );
    } else {
      alert('Your browser does not support geolocation.');
    }
  }

  confirmLocation(): void {
    console.log('✅ Location confirmed:', this.checkoutData.address);
    this.closeMapModal();
  }

  /** ------------------ ✅ PLACE ORDER ------------------ **/
  placeOrder(): void {
    if (!this.validateForm()) return;

    this.isPlacingOrder = true;
    setTimeout(() => {
      this.isPlacingOrder = false;
      localStorage.removeItem('shop-cart');
      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: this.generateOrderId() }
      });
    }, 2000);
  }

  private validateForm(): boolean {
    const { fullName, email, phone, address } = this.checkoutData;

    if (!fullName || !email || !phone || !address.street || !address.city || !address.province || !address.postalCode) {
      alert('Please fill all required fields.');
      return false;
    }

    if (!this.isValidEmail(email)) {
      alert('Invalid email format.');
      return false;
    }

    if (!this.isValidPhone(phone)) {
      alert('Invalid phone number.');
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
