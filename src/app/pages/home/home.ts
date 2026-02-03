import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
  imagen?: string | null;
  es_nuevo?: boolean | null;
  en_oferta?: boolean | null;
  precio_antes?: number | null;
  created_at?: string | null;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ScrollingModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private cart: CartService,
    private cache: ProductCacheService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  heroProductos: Producto[] = [];
  currentSlide = 0;
  autoplayId: any;
  autoplayMs = 5000;

  goToSlide(i: number) {
    this.currentSlide = i;
    this.restartAutoplay();
  }

  nextSlide() {
    if (!this.heroProductos.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.heroProductos.length;
  }

startAutoplay() {
  if (!this.heroProductos.length) return;

  clearInterval(this.autoplayId);

  this.autoplayId = setInterval(() => {
    this.currentSlide =
      (this.currentSlide + 1) % this.heroProductos.length;
  }, this.autoplayMs);
}

  restartAutoplay() {
    clearInterval(this.autoplayId);
    this.startAutoplay();
  }

  pauseAutoplay() {
    clearInterval(this.autoplayId);
  }

  resumeAutoplay() {
    this.startAutoplay();
  }

async cargarHero() {
  const key = 'home_hero';
  const cached = this.cache.get<Producto[]>(key);

  if (cached) {
    this.heroProductos = cached;
    this.currentSlide = 0;
    setTimeout(() => this.cdr.detectChanges());
    return;
  }

  const { data } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  this.heroProductos = data ?? [];
  this.currentSlide = 0;
  this.cache.set(key, this.heroProductos);

  setTimeout(() => this.cdr.detectChanges());
}

  categorias = [
    { name: 'Maquillaje', slug: 'maquillaje', img: 'assets/icons/icono-maquillaje.png' },
    { name: 'Cuidado de la piel', slug: 'skincare', img: 'assets/icons/icono-cuidado-facial.png' },
    { name: 'Cuidado capilar', slug: 'capilar', img: 'assets/icons/icono-cuidado-capilar.png' },
    { name: 'Accesorios', slug: 'accesorios', img: 'assets/icons/icono-accesorios.png' },
  ];

  loadingNovedades = true;
  loadingOfertas = true;
  novedades: Producto[] = [];
  ofertas: Producto[] = [];

  async ngOnInit() {
    await this.cargarHero();
    this.startAutoplay();
    this.cargarNovedades();
    this.cargarOfertas();
  }

  ngOnDestroy() {
    clearInterval(this.autoplayId);
  }

  irACategoria(slug: string) {
    this.router.navigate(['/categoria', slug]);
  }

  verProducto(id: string) {
    this.router.navigate(['/producto', id]);
  }

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

  descuentoPct(p: Producto): number {
    if (!p.precio_antes || p.precio_antes <= p.precio) return 0;
    return Math.round(((p.precio_antes - p.precio) / p.precio_antes) * 100);
  }

async cargarNovedades() {
  const key = 'home_novedades';
  const cached = this.cache.get<Producto[]>(key);

  if (cached) {
    this.novedades = cached;
    this.loadingNovedades = false;
    this.cdr.detectChanges();
    return;
  }

  const { data } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  this.novedades = data ?? [];
  this.cache.set(key, this.novedades);
  this.loadingNovedades = false;

  this.cdr.detectChanges();
}

  async cargarOfertas() {
  const key = 'home_ofertas';
  const cached = this.cache.get<Producto[]>(key);

  if (cached) {
    this.ofertas = cached;
    this.loadingOfertas = false;
    this.cdr.detectChanges();
    return;
  }

  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('en_oferta', true)
    .limit(20);

  this.ofertas = data ?? [];
  this.cache.set(key, this.ofertas);
  this.loadingOfertas = false;

  this.cdr.detectChanges();
  }
}
