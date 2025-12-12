import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { CheckoutService } from '../../core/services/checkout.service';

interface OrderItem {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone?: string;
}

interface ShippingInfo {
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
}

interface OrderDetails {
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  customer: CustomerInfo;
  shipping: ShippingInfo;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
}

interface OrderResponse {
  success: boolean;
  message?: string;
  order?: OrderDetails;
}





@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms 300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      state('void', style({ transform: 'translateX(-20px)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition(':enter', [animate('400ms 200ms ease-out')])
    ]),
    trigger('pulse', [
      state('initial', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.1)' })),
      transition('initial <=> pulse', [animate('500ms ease-in-out')])
    ])
    
  ]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(private checkoutService: CheckoutService) {}

  shopSlug: string = '';
  orderId: number = 0;
  isLoading = true;
  isError = false;
  errorMessage = '';

  orderDetails: OrderDetails = {
    orderId: 0,
    orderStatus: '',
    paymentStatus: '',
    createdAt: '',
    items: [],
    customer: { fullName: '', email: '', phone: '' },
    shipping: { address: '', city: '', province: '', postalCode: '' },
    subtotal: 0,
    tax: 0,
    shippingCost: 0,
    totalAmount: 0
  };

  orderStatusConfig: { [key: string]: { label: string; color: string } } = {
    pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  };

  paymentStatusConfig: { [key: string]: { label: string; color: string } } = {
    pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' },
    pending_cod: { label: 'Pending COD', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  };

  ngOnInit(): void {
    this.shopSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.orderId = +this.route.snapshot.paramMap.get('orderId')!;

    // Fetch order details from service
    this.fetchOrderDetails();
  }

  fetchOrderDetails(): void {
    this.isLoading = true;
    this.isError = false;

    this.checkoutService.getOrder(this.orderId)
      .pipe(
        catchError(error => {
          console.error('Error fetching order details:', error);
          this.isError = true;
          this.errorMessage = error.error?.message || 'Failed to load order details.';
          this.isLoading = false;
          return of({ success: false, message: this.errorMessage } as OrderResponse);
        })
      )
      .subscribe((response: OrderResponse) => {
        this.isLoading = false;
        if (response.success && response.order) {
          this.orderDetails = response.order;
          this.calculateTotals();
        } else {
          this.isError = true;
          this.errorMessage = response.message || 'Order not found.';
        }
      });
  }

  private calculateTotals(): void {
    if (!this.orderDetails.subtotal && this.orderDetails.items.length > 0) {
      this.orderDetails.subtotal = this.orderDetails.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );
    }

    if (!this.orderDetails.totalAmount && this.orderDetails.subtotal) {
      this.orderDetails.tax = this.orderDetails.tax || this.orderDetails.subtotal * 0.13;
      this.orderDetails.shippingCost = this.orderDetails.shippingCost ?? (this.orderDetails.subtotal > 2000 ? 0 : 200);
      this.orderDetails.totalAmount = this.orderDetails.subtotal + this.orderDetails.tax + this.orderDetails.shippingCost;
    }
  }

  getOrderStatusConfig() {
    const status = this.orderDetails.orderStatus.toLowerCase();
    const configs: Record<string, { label: string; color: string }> = {
        'pending_payment': { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' },
        'confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
        'processing': { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
        'pending_cod': { label: 'Pending COD', color: 'bg-orange-100 text-orange-800' },
        'shipped': { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
        'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

getPaymentStatusConfig() {
    const status = this.orderDetails.paymentStatus.toLowerCase();
    const configs: Record<string, { label: string; color: string }> = {
        'pending': { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' },
        'pending_cod': { label: 'Pending COD', color: 'bg-orange-100 text-orange-800' },
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800' },
        'failed': { label: 'Payment Failed', color: 'bg-red-100 text-red-800' }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getEstimatedDeliveryDate(): string {
    const date = new Date(this.orderDetails.createdAt || new Date());
    date.setDate(date.getDate() + 3); // 3 days delivery
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  calculateItemTotal(item: any): number {
    return item.price * item.quantity;
  }

  continueShopping(): void {
    this.router.navigate(['/shop', this.shopSlug]);
  }

  printOrder(): void {
    window.print();
  }

  shareOrder(): void {
    const shareText = `I just placed an order #${this.orderId} from ${this.shopSlug}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({ title: `Order #${this.orderId}`, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert('Order link copied to clipboard!'));
    }
  }

  getStatusAnimationState(): string {
    return this.orderDetails.orderStatus === 'confirmed' || this.orderDetails.orderStatus === 'processing' ? 'pulse' : 'initial';
  }
}
