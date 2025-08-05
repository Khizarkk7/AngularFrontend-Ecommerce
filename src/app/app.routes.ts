import { Routes } from '@angular/router';

import { RegistrationComponent } from './core/registration/registration.component';
import { LoginComponent } from './core/login/login.component';
import { ForgotPassComponent } from './core/forgot-pass/forgot-pass.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { authGuard } from './core/guards/auth.guard';
//import { ShopComponent } from './shop-portal/shop.component';
import { UnauthorizedComponent } from './core/unauthorized/unauthorized.component';
import { InventoryComponent } from './shared/inventory/inventory.component';
import { AddUserComponent } from './admin-portal/users/add-user/add-user.component';
import { ShowAllUsersComponent } from './admin-portal/users/show-all-users/show-all-users.component';




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
    data: { roles: ['systemAdmin','shopAdmin'] }  // only SystemAdmin can access
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
  { path: 'inventory', component: InventoryComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'users/add', component: AddUserComponent },
  { path: 'users/edit', component: ShowAllUsersComponent },


];


