import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ShopService } from '../core/services/shops.service';
import Swal from 'sweetalert2';
import { AsideBarComponent } from '../shared/ui/aside-bar/aside-bar.component';
import { AdminHeaderComponent } from '../shared/ui/admin-header/admin-header.component';



declare var bootstrap: any; // For Bootstrap Modal
@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AsideBarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-portal.component.html',
  styleUrls: ['./admin-portal.component.css']
})
export class AdminPortalComponent implements OnInit {

  shops: any[] = [];
  shopForm!: FormGroup;
  isEditMode: boolean = false;
  selectedShopId: number | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;
  showShopTable = false;
  userRole: string = '';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private shopService: ShopService
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role; // Adjust 'role' if your payload uses a different key
    }
    // Check user role from token or service
  }

  userName: string = '';

  ngOnInit(): void {

  }

  sidebarVisible: boolean = true; 

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
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

    //added on monday
  }





}