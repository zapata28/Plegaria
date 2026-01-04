import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: Auth, private router: Router) {}

  async entrar() {
    this.errorMsg = '';
    this.loading = true;

    try {
      await this.auth.login(this.email.trim(), this.password);
      this.router.navigate(['/admin']);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error iniciando sesión';
    } finally {
      this.loading = false;
    }
  }
}
