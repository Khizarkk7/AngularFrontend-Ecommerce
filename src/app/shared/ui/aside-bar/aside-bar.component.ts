import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-aside-bar',
  standalone: true,
  imports: [RouterLink, CommonModule,RouterOutlet],
  templateUrl: './aside-bar.component.html',
  styleUrl: './aside-bar.component.css'
})
export class AsideBarComponent {
  sidebarCollapsed = signal(false);
  isProfileOpen = signal(false);
  isShopMenuOpen = false;
  isHomeMenuOpen = false;

  menuItems: any[] = [];
  structuredMenu: any[] = []; 

  @Output() shopInfoClick = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

 ngOnInit(): void {
  const roleId = this.authService.getRoleId();

  if (roleId) {
    this.menuService.getMenusByRole(roleId).subscribe({
      next: (data) => {
        this.menuItems = data;
        this.structuredMenu = this.buildMenuTree(this.menuItems);

        // Initialize expanded state
        this.structuredMenu.forEach(menu => {
          menu.expanded = false;
        });
      },
      error: (err) => {
        console.error('Error loading menus:', err);
      }
    });
  } else {
    console.warn('No roleId found in token.');
  }
}


 buildMenuTree(menuList: any[]): any[] {
  const map = new Map<number, any>();
  const roots: any[] = [];

  menuList.forEach(menu => {
    menu.children = [];
    map.set(menu.id, menu);
  });

  menuList.forEach(menu => {
    menu.expanded = false; 
    if (menu.parentId) {
      const parent = map.get(menu.parentId);
      if (parent) parent.children.push(menu);
    } else {
      roots.push(menu);
    }
  });

  return roots;
}

  toggleMenu(menu: any) {
    menu.expanded = !menu.expanded;
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(prev => !prev);
  }


}
