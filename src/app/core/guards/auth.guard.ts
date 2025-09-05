import { inject } from '@angular/core';
import { CanActivateFn,Router} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLogedIn();
  const expectedRoles = route.data?.['roles'] as string[]; // e.g. ['SystemAdmin']
  console.log(expectedRoles);

  const userRole = localStorage.getItem('role'); // assuming role is stored during login
console.log(userRole);
  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && !expectedRoles.includes(userRole!)) {
    router.navigate(['/unauthorized']); 
    return false;
  }

  //  //  role check
  // if (expectedRoles && !expectedRoles.includes(userRole!)) {
  //   router.navigate(['/unauthorized']); 
  //   return false;
  // }

  //  shopId check
  const currentShopId = authService.getCurrentShopId();
  const routeShopId = route.params?.['shopId'];  // yaha URL ka :shopId milega

  // if (routeShopId && currentShopId && parseInt(routeShopId) !== currentShopId) {
  //   router.navigate(['/unauthorized']);
  //   return false;
  // }

  return true;
};