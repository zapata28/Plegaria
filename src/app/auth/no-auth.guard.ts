import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const noAuthGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.user) {
    await auth.init();
  }

  // si está logueado, no lo dejes entrar a /login
  if (auth.isLoggedIn()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
