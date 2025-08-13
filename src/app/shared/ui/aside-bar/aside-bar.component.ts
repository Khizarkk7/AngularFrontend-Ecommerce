import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal, EventEmitter, Output, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-aside-bar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet],
  templateUrl: './aside-bar.component.html',
  styleUrl: './aside-bar.component.css'
})
export class AsideBarComponent {
  sidebarCollapsed = signal(false);
  isSidebarOpen = true;
  isMobile = false;

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
    this.checkScreenSize();

    const roleId = this.authService.getRoleId();
    if (roleId) {
      this.menuService.getMenusByRole(roleId).subscribe({
        next: (data) => {
          this.menuItems = data;
          this.structuredMenu = this.buildMenuTree(this.menuItems);
          this.structuredMenu.forEach(menu => menu.expanded = false);
        },
        error: (err) => console.error('Error loading menus:', err)
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
    if (this.isMobile) {
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      this.sidebarCollapsed.update(prev => !prev);
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 992;
      if (this.isMobile) {
        this.isSidebarOpen = false;
      } else {
        this.isSidebarOpen = true;
      }
    }
  }
}
