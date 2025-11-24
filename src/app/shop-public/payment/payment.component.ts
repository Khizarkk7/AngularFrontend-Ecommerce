import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [NgIf],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  orderId: string;
  shopSlug: string;
  orderDetails: any;
  amount: number = 0;
  paymentMethod: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.orderId = this.route.snapshot.params['orderId'];
    this.shopSlug = this.route.snapshot.params['slug'];
  }

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    this.http.get(`/api/orders/${this.orderId}`).subscribe({
      next: (order: any) => {
        this.orderDetails = order;
        this.amount = order.grandTotal;
        this.paymentMethod = order.paymentMethod;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load order:', error);
        this.router.navigate(['/']);
      }
    });
  }

  processCardPayment(): void {
    // Card payment logic
    this.http.post(`/api/payments/process-card`, {
      orderId: this.orderId,
      amount: this.amount
    }).subscribe({
      next: (response: any) => {
        this.router.navigate([
          this.shopSlug ? `/shop/${this.shopSlug}/order-success/${this.orderId}` 
                        : `/order-success/${this.orderId}`,
        ], {
          queryParams: { payment: 'card_success' }
        });
      },
      error: (error) => {
        console.error('Payment failed:', error);
      }
    });
  }

  redirectToJazzCash(): void {
    // Redirect to JazzCash gateway
    window.location.href = `https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction?${this.generateJazzCashParams()}`;
  }

  redirectToEasyPaisa(): void {
    // Redirect to EasyPaisa gateway
    window.location.href = `https://easypay.easypaisa.com.pk/easypay/Index.jsf?${this.generateEasyPaisaParams()}`;
  }

  private generateJazzCashParams(): string {
    return `amount=${this.amount}&orderId=${this.orderId}&returnUrl=${encodeURIComponent(window.location.origin + '/payment-callback')}`;
  }

  private generateEasyPaisaParams(): string {
    return `amount=${this.amount}&orderRefNum=${this.orderId}&postBackURL=${encodeURIComponent(window.location.origin + '/payment-callback')}`;
  }

  cancelPayment(): void {
    this.router.navigate([
      this.shopSlug ? `/shop/${this.shopSlug}/checkout` 
                    : '/checkout'
    ]);
  }
}