import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class CarritoComponent {
  constructor(public cart: CartService) {}

  // ===== CONFIG ENVÍO =====
  envioBase = 12000;
  envioGratisDesde = 150000;

  get subtotal(): number {
    return this.cart.subtotalSig();
  }

  get envio(): number {
    return this.subtotal >= this.envioGratisDesde ? 0 : this.envioBase;
  }

  get total(): number {
    return this.subtotal + this.envio;
  }
  get whatsappLink(): string {
  const items = this.cart.itemsSig();

  const lineas = items.map(it => {
    const lineTotal = it.precio * it.qty;
    return `• ${it.nombre} x${it.qty} = ${this.money(lineTotal)}`;
  });

    const msg =
      `Hola 👋 Quiero hacer este pedido:

      ${lineas.join('\n')}

      Subtotal: ${this.money(this.subtotal)}
      Envío: ${this.envio === 0 ? 'Gratis' : this.money(this.envio)}
      Total: ${this.money(this.total)}

      ¿Me confirmas disponibilidad y tiempo de entrega?`;

        return `https://wa.me/573202507109?text=${encodeURIComponent(msg)}`;
      }

      finalizarWhatsApp() {
        window.open(this.whatsappLink, '_blank', 'noopener');
      }


  money(v: number) {
    return v.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }
}
