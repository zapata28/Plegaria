import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { AuthService } from './auth/auth'; // <-- ajusta si tu archivo se llama distinto

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.init();
  }
}
