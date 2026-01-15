import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../../supabase.client';
import { CartService } from '../../cart.service';
import { ProductCacheService } from '../../services/product-cache';

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
  constructor(
    private router: Router,
    private cart: CartService,
    private productCache: ProductCacheService
  ) {}

  // ================= HERO =================
  currentSlide = 0;
  private autoplayId: any = null;
  private autoplayMs = 5000;

  slides = [
    {
      image: 'img/centella-ampoule.jpg',
      title: 'Espuma de ampolla de centella',
      text: 'Limpiador facial suave con Centella Asiática.',
      button: 'Ver producto',
    },
    {
      image: 'img/Mixsoon_Centella.jpg',
      title: 'Espuma calmante para piel sensible',
      text: 'Limpia sin irritar la piel.',
      button: 'Explorar',
    },
    {
      image: 'img/slide3.jpg',
      title: 'Tu rutina empieza aquí',
      text: 'Descubre productos pensados para ti.',
      button: 'Ver todo',
    },
  ];

  // ================= CATEGORÍAS =================
  categorias = [
    { name: 'Maquillaje', slug: 'maquillaje', img: 'assets/icons/icono-maquillaje.png' },
    { name: 'Cuidado de la piel', slug: 'skincare', img: 'assets/icons/icono-cuidado-facial.png' },
    { name: 'Cuidado capilar', slug: 'capilar', img: 'assets/icons/icono-cuidado-capilar.png' },
    { name: 'Accesorios', slug: 'accesorios', img: 'assets/icons/icono-accesorios.png' },
  ];

  // ================= DATA =================
  loadingNovedades = true;
  loadingOfertas = true;

  novedades: Producto[] = [];
  ofertas: Producto[] = [];

  // ================= LIFECYCLE =================
  ngOnInit(): void {
    this.startAutoplay();
    this.cargarNovedades();
    this.cargarOfertas();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  // ================= HERO CONTROLS =================
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

  // ================= NAV =================
  irACategoria(slug: string) {
    this.router.navigate(['/categoria', slug]);
  }

  verProducto(id: string) {
    this.router.navigate(['/producto', id]);
  }

  // ================= CARRITO =================
  addToCart(p: Producto) {
    this.cart.add(
      {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen ?? '',
      },
      1
    );
  }

  // ================= UTIL =================
  descuentoPct(p: Producto): number {
    if (!p.precio_antes || p.precio_antes <= p.precio) return 0;
    return Math.round(((p.precio_antes - p.precio) / p.precio_antes) * 100);
  }

  // ================= SUPABASE + CACHE =================
  async cargarNovedades() {
    const cacheKey = 'home_novedades';
    const cached = this.productCache.get<Producto[]>(cacheKey);

    if (cached) {
      this.novedades = cached;
      this.loadingNovedades = false;
      return;
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    this.loadingNovedades = false;

    if (error) {
      console.error('Error novedades:', error.message);
      return;
    }

    this.novedades = data ?? [];
    this.productCache.set(cacheKey, this.novedades);
  }

  async cargarOfertas() {
    const cacheKey = 'home_ofertas';
    const cached = this.productCache.get<Producto[]>(cacheKey);

    if (cached) {
      this.ofertas = cached;
      this.loadingOfertas = false;
      return;
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('en_oferta', true)
      .order('created_at', { ascending: false })
      .limit(10);

    this.loadingOfertas = false;

    if (error) {
      console.error('Error ofertas:', error.message);
      return;
    }

    this.ofertas = data ?? [];
    this.productCache.set(cacheKey, this.ofertas);
  }
}
