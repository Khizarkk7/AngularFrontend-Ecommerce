import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout.service';
import { PaymentService } from '../../core/services/payment.service';
import { CustomSwal } from '../../core/services/custom-swal.service';
import * as L from 'leaflet';
import { ShopPublicService } from '../../core/services/shop-public.service';
import { CartService } from '../../core/services/cart.service';

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
  imageUrl?: string;
}

// Backend compatible interfaces
interface OrderRequest {
  shopId: number;
  customer: CustomerDto;
  shipping: ShippingDto;
  payment: PaymentDto;
  cartItems: CartItemDto[];
}

interface CustomerDto {
  fullName: string;
  email: string;
  phone: string;
}

interface ShippingDto {
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface PaymentDto {
  method: string;
}

interface CartItemDto {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface OrderResponse {
  success: boolean;
  message: string;
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
  requiresPayment: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private checkoutService = inject(CheckoutService);
  private paymentService = inject(PaymentService);
  private shopService = inject(ShopPublicService);
  private cartService = inject(CartService);

  shopSlug = '';
  shopId!: number;

  checkoutData: CheckoutData = {
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', province: '', postalCode: '' },
    paymentMethod: 'credit_card',
    notes: ''
  };

  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingCost = 0;
  discount = 0;
  tax = 0;
  grandTotal = 0;
  promoCode = '';
  appliedPromo = false;

  isPlacingOrder = false;
  showMapModal = false;

  // Payment methods
  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'debit_card', label: 'Debit Card', icon: '💳' },
    { value: 'jazzcash', label: 'JazzCash', icon: '📱' },
    { value: 'easypaisa', label: 'EasyPaisa', icon: '📱' },
    { value: 'cod', label: 'Cash on Delivery', icon: '💰' }
  ];

  private map!: L.Map;
  private marker!: L.Marker;

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.shopSlug = params.get('slug') ?? '';
      
      if (!this.shopSlug) {
        console.error('❌ slug missing');
        return;
      }

      this.loadCartItems();
      this.calculateTotals();
      this.loadShopBySlug();
    });
  }

  /** Get shopId from slug dynamically */
  private loadShopBySlug(): void {
    this.shopService.getShopBySlug(this.shopSlug).subscribe({
      next: (shop) => {
        this.shopId = Number((shop as any)?.shopId ?? (shop as any)?.id);
      },
      error: (err) => {
        console.error('❌ Failed to load shop', err);
      }
    });
  }

  /** ------------------ CART METHODS ------------------ **/
  loadCartItems(): void {
    this.cartItems = this.cartService.getCartSnapshot();

    if (this.cartItems.length === 0) {
      this.router.navigate(['/shop', this.shopSlug]);
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.shippingCost = this.subtotal > 2000 ? 0 : 200;
    this.tax = this.subtotal * 0.13;
    this.grandTotal = this.subtotal + this.shippingCost + this.tax - this.discount;
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
          text: 'You\'ve got a 10% discount!',
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
    try {
      // 1️⃣ Validate form
      const isValid = await this.validateForm();
      if (!isValid) return;

      const paymentMethod = this.checkoutData.paymentMethod;
      const isCOD = paymentMethod === 'cod';

      // 2️⃣ Confirm order
      const confirm = await CustomSwal.fire({
        icon: 'question',
        title: 'Confirm Order',
        text: isCOD
          ? 'Your COD order will be placed immediately.'
          : 'You will be redirected to payment gateway.',
        showCancelButton: true,
        confirmButtonText: isCOD ? 'Place COD Order' : 'Proceed to Payment',
        cancelButtonText: 'Cancel',
        confirmButtonColor: isCOD ? '#10B981' : '#3B82F6'
      });

      if (!confirm.isConfirmed) return;

      // 3️⃣ Set placing order state
      this.isPlacingOrder = true;

      // 4️⃣ Ensure shopId is loaded
      await this.ensureShopLoaded();

      // 5️⃣ Build payload
      const orderPayload: OrderRequest = {
        shopId: this.shopId!,
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
        payment: { method: paymentMethod },
        cartItems: this.cartItems.map(i => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      };

      // 6️⃣ Send order to backend
      const res = await this.checkoutService.createOrder(orderPayload).toPromise();

      if (!res) throw new Error('No response from server');
      if (!res.success) throw new Error(res.message);

      // 7️⃣ Handle based on payment method
      if (isCOD) {
        // COD FLOW: Checkout → Order Success (direct)
        await this.handleCODSuccess(res);
      } else {
        // Online Payment FLOW: Checkout → Payment → Payment Success → Order Success
        await this.handleOnlinePayment(res);
      }

    } catch (err: any) {
      console.error('❌ Place Order Error:', err);
      await this.handleOrderError(err);
    } finally {
      this.isPlacingOrder = false;
    }
  }

  private async handleCODSuccess(res: OrderResponse): Promise<void> {
    // Clear cart for COD immediately
    this.cartService.clearCart();
    
    await CustomSwal.fire({
      icon: 'success',
      title: 'Order Placed Successfully!',
      text: `Your COD order #${res.orderId} has been placed.`,
      timer: 2500,
      showConfirmButton: false
    });

    // Redirect to order success page directly
    this.router.navigate(['/shop', this.shopSlug, 'order-success', res.orderId], {
      queryParams: { 
        method: 'cod',
        status: 'confirmed',
        paymentStatus: 'pending'
      }
    });
  }

  private async handleOnlinePayment(res: OrderResponse): Promise<void> {
    // For online payment, DO NOT clear cart yet
    await CustomSwal.fire({
      icon: 'info',
      title: 'Redirecting to Payment',
      text: 'Please complete the payment to confirm your order.',
      timer: 2000,
      showConfirmButton: false
    });

    // Redirect to payment page
    this.router.navigate(['/shop', this.shopSlug, 'payment', res.orderId], {
      queryParams: { 
        amount: this.grandTotal,
        method: this.checkoutData.paymentMethod 
      }
    });
  }

  private async ensureShopLoaded(): Promise<void> {
    if (this.shopId) return;

    return new Promise<void>((resolve, reject) => {
      this.shopService.getShopBySlug(this.shopSlug).subscribe({
        next: (shop) => {
          this.shopId = Number((shop as any)?.shopId ?? (shop as any)?.id);
          resolve();
        },
        error: (err) => {
          console.error('❌ Failed to load shop:', err);
          reject(err);
        }
      });
    });
  }

  /** ------------------ VALIDATION ------------------ **/
  private async validateForm(): Promise<boolean> {
    const { fullName, email, phone, address, paymentMethod } = this.checkoutData;
    
    // Basic required fields validation
    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || 
        !address.street?.trim() || !address.city?.trim() || 
        !address.province?.trim() || !address.postalCode?.trim() ||
        !paymentMethod) {
      await CustomSwal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK'
      });
      return false;
    }

    // Email validation
    if (!this.isValidEmail(email)) {
      await CustomSwal.fire({ 
        icon: 'error', 
        title: 'Invalid Email', 
        text: 'Please enter a valid email address.' 
      });
      return false;
    }

    // Phone validation
    if (!this.isValidPhone(phone)) {
      await CustomSwal.fire({ 
        icon: 'error', 
        title: 'Invalid Phone', 
        text: 'Please enter a valid phone number (10-15 digits).' 
      });
      return false;
    }

    // Cart validation
    if (this.cartItems.length === 0) {
      await CustomSwal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Your cart is empty. Please add items before checkout.'
      });
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[+]?[0-9\s\-\(\)]{10,15}$/.test(phone);
  }

  private async handleOrderError(err: any): Promise<void> {
    const errorMessage = err?.error?.message || 
                        err?.message || 
                        'Something went wrong while placing the order.';

    await CustomSwal.fire({
      icon: 'error',
      title: 'Order Failed',
      text: errorMessage,
      confirmButtonText: 'Try Again'
    });
  }

  // Helper method to get payment method label
  getPaymentMethodLabel(method: string): string {
    const found = this.paymentMethods.find(p => p.value === method);
    return found ? `${found.icon} ${found.label}` : method;
  }
}