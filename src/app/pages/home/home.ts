import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../../supabase.client';
import { CartService } from '../../cart.service';

type CategoriaSlug = 'maquillaje' | 'skincare' | 'capilar' | 'accesorios';

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria: CategoriaSlug;
  grupo?: string | null;
  subgrupo?: string | null;
  imagen?: string | null;
  es_nuevo?: boolean | null;
  en_oferta?: boolean | null;
  precio_antes?: number | null;
  created_at?: string | null;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  constructor(private router: Router, private cart: CartService) {}

  // HERO
  currentSlide = 0;
  private autoplayId: any = null;
  private autoplayMs = 5000;

  slides = [
    {
      image: 'img/centella-ampoule.jpg',
      title: 'Espuma de ampolla de centella',
      text: `Es un limpiador facial suave y eficaz diseñado para limpiar
      la piel de impurezas sin agredirla. Está formulado con extracto de
      Centella Asiática, una planta conocida por sus propiedades calmantes
      y reparadoras.`,
      button: 'Ver producto',
    },
    {
      image: 'img/Mixsoon_Centella.jpg',
      title: 'Espuma limpiadora calmante para piel sensible',
      text: `Es una espuma limpiadora facial suave y eficaz, formulada con
      Centella Asiática, ideal para limpiar la piel en pocos segundos sin causar
      irritación.`,
      button: 'Explorar',
    },
    {
      image: 'img/slide3.jpg',
      title: 'Tu rutina empieza aquí',
      text: 'Mensaje promocional.',
      button: 'Ver todo',
    },
  ];

  // CATEGORÍAS
  categorias = [
    { name: 'Maquillaje', slug: 'maquillaje', img: 'assets/icons/icono-maquillaje.png' },
    { name: 'Cuidado de la piel', slug: 'skincare', img: 'assets/icons/icono-cuidado-facial.png' },
    { name: 'Cuidado capilar', slug: 'capilar', img: 'assets/icons/icono-cuidado-capilar.png' },
    { name: 'Accesorios', slug: 'accesorios', img: 'assets/icons/icono-accesorios.png' },
  ];

  // NOVEDADES
  loadingNovedades = true;
  novedades: Producto[] = [];

  // DESCUENTOS / OFERTAS
  loadingOfertas = true;
  ofertas: Producto[] = [];

  ngOnInit(): void {
    this.startAutoplay();
    this.cargarNovedades();
    this.cargarOfertas();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  // HERO CONTROLS
  goToSlide(index: number) {
    this.currentSlide = index;
    this.restartAutoplay();
  }

  private nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  private startAutoplay() {
    if (this.autoplayId) return;
    this.autoplayId = setInterval(() => this.nextSlide(), this.autoplayMs);
  }

  private stopAutoplay() {
    if (!this.autoplayId) return;
    clearInterval(this.autoplayId);
    this.autoplayId = null;
  }

  private restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  pauseAutoplay() {
    this.stopAutoplay();
  }

  resumeAutoplay() {
    this.startAutoplay();
  }

  // NAV
  irACategoria(slug: string) {
    this.router.navigate(['/categoria', slug]);
  }

  verProducto(id: string) {
  this.router.navigate(['/producto', id]);
}


  // CARRITO
  addToCart(p: Producto) {
    this.cart.add(
      {
        id: String(p.id),
        nombre: p.nombre,
        precio: Number(p.precio),
        imagen: p.imagen ?? '',
      },
      1
    );
  }

  // ✅ % DESCUENTO (OPCIÓN 3)
  descuentoPct(p: Producto): number {
    const antes = Number(p.precio_antes ?? 0);
    const ahora = Number(p.precio ?? 0);
    if (!antes || antes <= 0 || ahora <= 0 || ahora >= antes) return 0;
    return Math.round(((antes - ahora) / antes) * 100);
  }

  // SUPABASE - NOVEDADES (ÚLTIMOS 10)
  async cargarNovedades() {
    this.loadingNovedades = true;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error cargando novedades:', error.message);
      this.novedades = [];
      this.loadingNovedades = false;
      return;
    }

    this.novedades = (data ?? []) as Producto[];
    this.loadingNovedades = false;
  }

  // SUPABASE - OFERTAS (SOLO en_oferta = true, ÚLTIMOS 10)
  async cargarOfertas() {
    this.loadingOfertas = true;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('en_oferta', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error cargando ofertas:', error.message);
      this.ofertas = [];
      this.loadingOfertas = false;
      return;
    }

    this.ofertas = (data ?? []) as Producto[];
    this.loadingOfertas = false;
  }
}
