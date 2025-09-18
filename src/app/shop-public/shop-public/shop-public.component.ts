import { Component } from '@angular/core';
import { ShopPublicService } from '../../core/services/shop-public.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-public.component.html',
  styleUrl: './shop-public.component.css'
})
export class ShopPublicComponent {

  shop: any;
    cart: any[] = [];
  cartOpen: boolean = false;


constructor(private route: ActivatedRoute, private shopPublicService: ShopPublicService) { }

ngOnInit(): void {
  const slug = this.route.snapshot.paramMap.get('slug');
  if (slug) {
    this.shopPublicService.getShopBySlug(slug).subscribe({
      next: (shop) => {
        console.log('Shop details:', shop);
        this.shop = shop;
      },
      error: (err) => {
        console.error('Error fetching shop details:', err);
      }
    });
  }
}

 addToCart(product: any): void {
    this.cart.push(product);
  }
toggleCart() {
  this.cartOpen = !this.cartOpen;
}

}
