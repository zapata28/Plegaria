import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { supabase } from '../../supabase.client';
import { CartService } from '../../cart.service';
import { Subscription } from 'rxjs';

type CategoriaSlug = 'maquillaje' | 'skincare' | 'capilar' | 'accesorios';

type ProductoModel = {
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
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './producto.html',
  styleUrls: ['./producto.css'],
})
export class Producto implements OnInit, OnDestroy {
  loading = true;
  producto: ProductoModel | null = null;

  loadingRelacionados = true;
  relacionados: ProductoModel[] = [];

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (!id) return;
      await this.cargarProducto(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async cargarProducto(id: string) {
    this.loading = true;
    this.loadingRelacionados = true;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error cargando producto:', error);
      this.producto = null;
      this.loading = false;
      this.loadingRelacionados = false;
      return;
    }

    this.producto = data as ProductoModel;
    this.loading = false;

    await this.cargarRelacionados(this.producto.categoria, this.producto.id);
  }

  async cargarRelacionados(categoria: CategoriaSlug, actualId: string) {
    this.loadingRelacionados = true;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', categoria)
      .neq('id', actualId)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error cargando relacionados:', error.message);
      this.relacionados = [];
      this.loadingRelacionados = false;
      return;
    }

    this.relacionados = (data ?? []) as ProductoModel[];
    this.loadingRelacionados = false;
  }

  // % DESCUENTO
  descuentoPct(p: ProductoModel): number {
    const antes = Number(p.precio_antes ?? 0);
    const ahora = Number(p.precio ?? 0);
    if (!antes || antes <= 0 || ahora <= 0 || ahora >= antes) return 0;
    return Math.round(((antes - ahora) / antes) * 100);
  }

  // Agregar al carrito
  addToCart(p: ProductoModel) {
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

  // Ver otro producto
  verProducto(id: string) {
    this.router.navigate(['/producto', id]);
  }

  // Volver
  volver() {
    this.router.navigate(['/categoria', this.producto?.categoria || 'maquillaje']);
  }
}
