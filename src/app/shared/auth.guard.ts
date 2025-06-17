import { inject } from '@angular/core';
import { CanActivateFn,Router} from '@angular/router';
import { AuthService } from './services/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
// const authService = inject(AuthService);
// const router = inject(Router);
//   if(authService.isLogedIn())
//   return true;
// else{
//   router.navigateByUrl('/login')
//   return false;
// }
//};
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLogedIn();
  const expectedRoles = route.data?.['roles'] as string[]; // e.g. ['SystemAdmin']
  const userRole = localStorage.getItem('role'); // assuming role is stored during login

  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && !expectedRoles.includes(userRole!)) {
    router.navigate(['/unauthorized']); 
    return false;
  }

  return true;
};