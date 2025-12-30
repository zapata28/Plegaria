import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Categoria } from './pages/categoria/categoria';

export const routes: Routes = [
  { path: '', component: Home },
  {path: 'categoria/:slug', component: Categoria}
];
