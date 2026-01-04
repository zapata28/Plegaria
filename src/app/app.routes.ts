import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categoria } from './pages/categoria/categoria';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { authGuard } from './auth/auth-guard';
import { noAuthGuard } from './auth/no-auth.guard';

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'categoria/:slug', component: Categoria },

  // ✅ Login protegido (si ya está logueado, lo manda a /admin)
  { path: 'login', component: Login, canActivate: [noAuthGuard] },

  // ✅ Admin protegido (si NO está logueado, lo manda a /login)
  { path: 'admin', component: Admin, canActivate: [authGuard] },

  // ✅ carrito con lazy load
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito/carrito').then(m => m.CarritoComponent),
  },

  // ✅ siempre al final
  { path: '**', redirectTo: '' },
];
