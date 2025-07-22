import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-aside-bar',
  standalone: true,
  imports: [],
  templateUrl: './aside-bar.component.html',
  styleUrl: './aside-bar.component.css'
})
export class AsideBarComponent {

sidebarCollapsed = signal(false);
  isProfileOpen = signal(false);
  isShopMenuOpen = false;
  isHomeMenuOpen = false;
  
  @Output() shopInfoClick = new EventEmitter<void>();
  
  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {}
    
   toggleSidebar() {
    this.sidebarCollapsed.update(prev => !prev);
  }

  toggleProfile() {
    this.isProfileOpen.update(prev => !prev);
  }

  toggleShopMenu() {
    this.isShopMenuOpen = !this.isShopMenuOpen;
  }

  closeShopMenu() {
    this.isShopMenuOpen = false;
  }

  toggleHomeMenu() {
    this.isHomeMenuOpen = !this.isHomeMenuOpen;
  }

  closeHomeMenu() {
    this.isHomeMenuOpen = false;
  }

  onShopInfoClick() {
    this.shopInfoClick.emit();
  }

  openInventoryInNewTab() {
      if (!isPlatformBrowser(this.platformId)) return;
  
      // Get current route parameters
      const urlTree = this.router.createUrlTree(['inventory'], { 
        relativeTo: this.route 
      });
      
      // Create full URL
      const url = this.router.serializeUrl(urlTree);
      const fullUrl = window.location.origin + url;
      
      // Open in new tab
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }


}
