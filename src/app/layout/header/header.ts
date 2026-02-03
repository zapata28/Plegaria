import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../auth/auth';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {

  menuOpen = false;
  cartOpen = false;
  userMenuOpen = false;

  searchOpen = false;
  searchTerm = '';

  constructor(
    public auth: Auth,
    private router: Router,
    public cart: CartService
  ) {}

  async salir(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
    this.closeAll();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.cartOpen = false;
      this.userMenuOpen = false;
      this.searchOpen = false;
    }
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
    if (this.cartOpen) {
      this.menuOpen = false;
      this.userMenuOpen = false;
      this.searchOpen = false;
    }
  }

  closeCart(): void {
    this.cartOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.menuOpen = false;
      this.cartOpen = false;
      this.searchOpen = false;
    }
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      this.menuOpen = false;
      this.cartOpen = false;
      this.userMenuOpen = false;
    }
  }

  goSearch(): void {
    if (!this.searchTerm.trim()) return;

    this.router.navigate(['/buscar'], {
      queryParams: { q: this.searchTerm.trim() }
    });

    this.searchTerm = '';
    this.searchOpen = false;
    this.closeAll();
  }

  closeAll(): void {
    this.menuOpen = false;
    this.cartOpen = false;
    this.userMenuOpen = false;
    this.searchOpen = false;
  }
}
