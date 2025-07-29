import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { map } from 'rxjs';

export const shopGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requestedShopId = route.paramMap.get('shopId');
  const tokenData = authService.getDecodedToken();

  // Debugging logs (remove after verification)
  console.log('Token Data:', tokenData);
  console.log('Requested Shop ID:', requestedShopId);

  // if (!tokenData?.shopId) {
  //   return router.createUrlTree(['/unauthorized'], {
  //     queryParams: { 
  //       reason: 'no_shop_association',
  //       returnUrl: state.url
  //     }
  //   });
  // }

  // if (requestedShopId !== tokenData.shopId.toString()) {
  //   return router.createUrlTree(['/unauthorized'], {
  //     queryParams: { 
  //       reason: 'shop_mismatch',
  //       attemptedShopId: requestedShopId,
  //       userShopId: tokenData.shopId,
  //       returnUrl: state.url
  //     }
  //   });
  // }

  return true;
};
