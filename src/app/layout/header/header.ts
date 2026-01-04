import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../auth/auth';
import { CartService } from '../../cart.service'; // ✅ ajusta la ruta si tu carpeta es otra

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  menuOpen = false;
  cartOpen = false;

  constructor(
    public auth: Auth,          // ✅ disponible en HTML
    private router: Router,     // ✅ para redirecciones
    public cart: CartService    // ✅ disponible en HTML
  ) {}

  async salir() {
    await this.auth.logout();
    this.router.navigate(['/']);
    this.closeAll();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.cartOpen = false;
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
    if (this.cartOpen) this.menuOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  closeCart() {
    this.cartOpen = false;
  }

  closeAll() {
    this.menuOpen = false;
    this.cartOpen = false;
  }
}
