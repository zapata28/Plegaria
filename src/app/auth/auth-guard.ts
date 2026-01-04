import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth'; // <-- si tu clase se llama AuthService, cambia aquí

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // ✅ si todavía no está inicializado el user, intenta cargar sesión
  if (!auth.user) {
    await auth.init();
  }

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
