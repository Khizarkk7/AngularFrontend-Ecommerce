import { Routes } from '@angular/router';

import { RegistrationComponent } from './cardentials/registration/registration.component';
import { LoginComponent } from './cardentials/login/login.component';
import { ForgotPassComponent } from './cardentials/forgot-pass/forgot-pass.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { authGuard } from './shared/auth.guard';
import { ShopComponent } from './shop-portal/shop.component';
import { UnauthorizedComponent } from './cardentials/unauthorized/unauthorized.component';
import { InventoryComponent } from './inventory/inventory.component';




export const routes: Routes = [

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  { path: 'signup', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotpass', component: ForgotPassComponent },

  {
    path: 'app-admin',
    component: AdminPortalComponent,
    canActivate: [authGuard],
    data: { roles: ['systemAdmin'] }  // only SystemAdmin can access
  },
  // {
  //   path: 'shop/:shopName/:shopId',
  //   component: ShopComponent,
  //   canActivate: [authGuard],
  //   data: { roles: ['shopAdmin'] },
  //   children: [
  //     {
  //       path: 'inventory', 
  //       component: InventoryComponent
  //     }
  //   ]
  // },
  {
    path: 'shop/:shopName/:shopId',
    component: ShopComponent,
    canActivate: [authGuard],
    data: { roles: ['shopAdmin'] },
    children: [
      {
        path: 'inventory',
        component: InventoryComponent
      }
    ]
  },
  { path: 'inventory', component: InventoryComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  

];

// {
//     path:'**',
//    component:ErrorComponent
// },


