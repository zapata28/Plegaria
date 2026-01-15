import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class CarritoComponent {
  constructor(public cart: CartService) {}

  envioBase = 12000;
  envioGratisDesde = 150000;

  pedidoEnviado = false;

  cliente = {
    nombre: '',
    direccion: '',
    ciudad: '',
    correo: '',
    telefono: '',
  };

  get subtotal(): number {
    return this.cart.subtotalSig();
  }

  get envio(): number {
    return this.subtotal >= this.envioGratisDesde ? 0 : this.envioBase;
  }

  get total(): number {
    return this.subtotal + this.envio;
  }

  finalizarWhatsApp() {
    const c = this.cliente;

    if (!c.nombre || !c.direccion || !c.ciudad || !c.correo || !c.telefono) {
      alert('Completa todos los datos');
      return;
    }

    window.open(this.whatsappLink, '_blank', 'noopener');

    // 👇 ORDEN CORRECTO
    this.pedidoEnviado = true;

    setTimeout(() => {
      this.cart.clear();
      this.resetFormulario();
    }, 300);
  }

  resetFormulario() {
    this.cliente = {
      nombre: '',
      direccion: '',
      ciudad: '',
      correo: '',
      telefono: '',
    };
  }

  get whatsappLink(): string {
    const lineas = this.cart.itemsSig().map(it =>
      `• ${it.nombre} x${it.qty} = ${this.money(it.precio * it.qty)}`
    );

    const msg =
`Hola 👋 Quiero hacer este pedido:

Nombre: ${this.cliente.nombre}
Dirección: ${this.cliente.direccion}
Ciudad: ${this.cliente.ciudad}
Correo: ${this.cliente.correo}
Teléfono: ${this.cliente.telefono}

Pedido:
${lineas.join('\n')}

Total: ${this.money(this.total)}`;

    return `https://wa.me/573202507109?text=${encodeURIComponent(msg)}`;
  }

  money(v: number) {
    return v.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }
}
