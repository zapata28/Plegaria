import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categoria } from './pages/categoria/categoria';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'categoria/:slug', component: Categoria },
  {path: 'login', component: Login },
  {path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'carrito', loadComponent: () =>import('./pages/carrito/carrito').then(m => m.CarritoComponent),},


];
