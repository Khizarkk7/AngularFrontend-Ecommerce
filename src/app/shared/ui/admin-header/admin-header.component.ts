import { CommonModule, NgIf } from '@angular/common';
import { Component,Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  standalone: true,
   imports: [
    CommonModule,NgIf
  ],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'] 
})
export class AdminHeaderComponent {
  @Input() userRole!: string; 
  @Output() logout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  

  onToggleSidebar() {
    
  }

  onLogout() {
    this.logout.emit();
  }
} 