import { Routes } from '@angular/router';

import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { ForgotPassComponent } from './user/forgot-pass/forgot-pass.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { authGuard } from './shared/auth.guard';
import { UserComponent } from './user/user.component';
import { ShopComponent } from './shop-portal/shop.component';
import { UnauthorizedComponent } from './user/unauthorized/unauthorized.component';




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
  {
    path: 'shop/:shopName/:shopId',
    component: ShopComponent,
    canActivate: [authGuard],
    data: { roles: ['shopAdmin'] }  // only ShopAdmin can access
  },
  { path: 'unauthorized', component: UnauthorizedComponent }

];

// {
//     path:'**',
//    component:ErrorComponent
// },


