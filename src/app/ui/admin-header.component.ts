import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent {
  @Output() logout = new EventEmitter<void>();
  @Output() createShop = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  onCreateShop() {
    this.createShop.emit();
  }
} 