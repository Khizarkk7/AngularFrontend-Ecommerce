import { Routes } from '@angular/router';

import { RegistrationComponent } from './core/registration/registration.component';
import { LoginComponent } from './core/login/login.component';
import { ForgotPassComponent } from './core/forgot-pass/forgot-pass.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { authGuard } from './core/guards/auth.guard';
import { UnauthorizedComponent } from './core/unauthorized/unauthorized.component';
import { InventoryComponent } from './admin-portal/products/inventory/inventory.component';
import { AddUserComponent } from './admin-portal/users/add-user/add-user.component';
import { ShowAllUsersComponent } from './admin-portal/users/show-all-users/show-all-users.component';
import { DashboardComponent } from './admin-portal/dashboard/dashboard.component';
import { AddShopComponent } from './admin-portal/shops/add-shop/add-shop.component';
import { AllShopsComponent } from './admin-portal/shops/all-shops/all-shops.component';
import { StockComponent } from './admin-portal/stocks/view-stock/view-stock.component';
import { AddProductComponent } from './admin-portal/products/add-product/add-product.component';
import { EditUserComponent } from './admin-portal/users/edit-user/edit-user.component';
import { EditShopComponent } from './admin-portal/shops/edit-shop/edit-shop.component';
import { DetailShopComponent } from './admin-portal/shops/detail-shop/detail-shop.component';
import { ShopPublicComponent } from './shop-public/shop-public/shop-public.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  { path: 'signup', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotpass', component: ForgotPassComponent },

  
  //lazy loading for public shop view
 {
  path: 'shop/:slug',
  loadComponent: () =>
    import('./shop-public/shop-public/shop-public.component').then(m => m.ShopPublicComponent)
},

{
  path: 'shop/:slug/checkout',
  loadComponent: () =>
    import('./shop-public/checkout/checkout.component').then(m => m.CheckoutComponent)
},
 {
    path: 'shop/:slug/payment/:orderId',
    loadComponent: () =>
      import('./shop-public/payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'shop/:slug/order-success/:orderId',
    loadComponent: () =>
      import('./shop-public/order-success/order-success.component').then(m => m.OrderSuccessComponent)
  },




  {
    path: 'app-admin',
    component: AdminPortalComponent,
    canActivate: [authGuard],
    data: { roles: ['systemAdmin', 'shopAdmin'] },
    children: [
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users/add', component: AddUserComponent, canActivate: [authGuard], data: { roles: ['systemAdmin'] } },
      { path: 'users/edit/:id', component: EditUserComponent, canActivate: [authGuard], data: { roles: ['systemAdmin'] } },
      { path: 'users/all', component: ShowAllUsersComponent, canActivate: [authGuard], data: { roles: ['systemAdmin'] } },
      { path: 'shops/add', component: AddShopComponent , canActivate: [authGuard], data: { roles: ['systemAdmin'] }},
      { path: 'shops/view', component: AllShopsComponent , canActivate: [authGuard], data: { roles: ['systemAdmin'] }},
      { path: 'shops/edit/:id', component: EditShopComponent , canActivate: [authGuard], data: { roles: ['systemAdmin'] }},

      { path: 'shops/:shopid/stock/all', component: StockComponent , canActivate: [authGuard], data: { roles: ['shopAdmin'] }},
      //{ path: 'shops/:shopid/stock/add', component: AddStockComponent , canActivate: [authGuard], data: { roles: ['shopAdmin'] }},
      { path: 'shops/:shopid/products/add', component: AddProductComponent , canActivate: [authGuard], data: { roles: ['shopAdmin'] }},
      { path: 'shops/:shopid/products/all', component: InventoryComponent , canActivate: [authGuard], data: { roles: ['shopAdmin'] }},
      //{ path: 'myshop', component: DetailShopComponent , canActivate: [authGuard], data: { roles: ['shopAdmin'] }},



    ]
  },

 // { path: 'unauthorized', component: UnauthorizedComponent }
];
