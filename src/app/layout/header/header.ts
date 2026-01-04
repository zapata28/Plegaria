import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../auth/auth';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {

  // Estados de UI
  menuOpen = false;       // menú categorías
  cartOpen = false;       // mini carrito
  userMenuOpen = false;  // menú usuario (👤)

  constructor(
    public auth: Auth,
    private router: Router,
    public cart: CartService
  ) {}

  /* ===============================
     SESIÓN
  ================================ */
  async salir() {
    await this.auth.logout();
    this.router.navigate(['/']);
    this.closeAll();
  }

  /* ===============================
     MENÚ CATEGORÍAS
  ================================ */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      this.cartOpen = false;
      this.userMenuOpen = false;
    }
  }

  closeMenu() {
    this.menuOpen = false;
  }

  /* ===============================
     CARRITO
  ================================ */
  toggleCart() {
    this.cartOpen = !this.cartOpen;

    if (this.cartOpen) {
      this.menuOpen = false;
      this.userMenuOpen = false;
    }
  }

  closeCart() {
    this.cartOpen = false;
  }

  /* ===============================
     MENÚ USUARIO (👤)
  ================================ */
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;

    if (this.userMenuOpen) {
      this.menuOpen = false;
      this.cartOpen = false;
    }
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  /* ===============================
     CERRAR TODO (overlay / navegación)
  ================================ */
  closeAll() {
    this.menuOpen = false;
    this.cartOpen = false;
    this.userMenuOpen = false;
  }
}
