import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/services/auth.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  sidebarCollapsed = signal(false);
  isProfileOpen = signal(false);
  isShopMenuOpen = false;
  isHomeMenuOpen = false;

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

  shopId: number = 0;
  shopName: string = '';
  username: any;
  role: any;



  constructor(private route: ActivatedRoute, private authService: AuthService,
    private router: Router) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.shopId = Number(params.get('shopId'));
      this.shopName = params.get('shopName') || '';
    });

    this.username = localStorage.getItem('username');
    this.role = localStorage.getItem('role');
  }

  onLogout() {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteToken();
        this.router.navigateByUrl('/login');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('shopId');
        localStorage.removeItem('shopName');
        localStorage.removeItem('username');
        sessionStorage.clear();


        Swal.fire({
          icon: 'success',
          title: 'Logged out!',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}
