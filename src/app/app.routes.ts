import { Routes } from '@angular/router';

import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { ForgotPassComponent } from './user/forgot-pass/forgot-pass.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { authGuard } from './shared/auth.guard';
import { UserComponent } from './user/user.component';
import { ShopComponent } from './shop-portal/shop.component';


export const routes: Routes = [

    {
        path:'',
       redirectTo: '/login',
       pathMatch: 'full'
    },
   
            {path:'signup',component:RegistrationComponent},
            {path:'login',component:LoginComponent},
            { path:'forgotpass', component: ForgotPassComponent },

    {
        path:'app-admin', component:AdminPortalComponent, canActivate:[authGuard],
        
    }, 
      // this is new dynamic route for shop dashboard
 
     {
    path: 'shop/:shopId/:shopName',
    component: ShopComponent,
    canActivate: [authGuard], // protect this too
  },
    ];
    
    // {
    //     path:'**',
    //    component:ErrorComponent
    // },


