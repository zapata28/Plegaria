import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
};

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.css'],
})
export class Categoria implements OnInit {

  slugActual!: CategoriaSlug;
  titulo = '';

  grupos: { nombre: string; items: string[] }[] = [];
  grupoActivo = 'Todos';

  subitems: string[] = [];
  subitemActivo = 'Todos';

  productos: Producto[] = [];
  loading = true;

  page = 1;
  pageSize = 12;
  total = 0;
  totalPages = 1;
  paginasVisibles: number[] = [];

  breadcrumbs: { label: string; action: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.slugActual = params.get('slug') as CategoriaSlug;
      this.setTitulo();
      this.setGrupos();
      this.page = 1;
      await this.cargarProductos();
    });
  }

  setTitulo() {
    const map: any = {
      maquillaje: 'Maquillaje',
      skincare: 'Cuidado de la piel',
      capilar: 'Cuidado capilar',
      accesorios: 'Accesorios'
    };
    this.titulo = map[this.slugActual];
  }

  setGrupos() {
    if (this.slugActual === 'maquillaje') {
      this.grupos = [
        { nombre: 'Rostro', items: ['Bases', 'Correctores', 'Polvos'] },
        { nombre: 'Ojos', items: ['Sombras', 'Pestañinas'] },
        { nombre: 'Labios', items: ['Labiales', 'Brillos'] }
      ];
    } else {
      this.grupos = [];
    }
  }

  async cargarProductos() {
    this.loading = true;

    const from = (this.page - 1) * this.pageSize;
    const to = from + this.pageSize - 1;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .eq('categoria', this.slugActual)
      .order('created_at', { ascending: false });

    if (this.grupoActivo !== 'Todos') {
      query = query.eq('grupo', this.grupoActivo);
    }

    if (this.subitemActivo !== 'Todos') {
      query = query.eq('subgrupo', this.subitemActivo);
    }

    const { data, count } = await query.range(from, to);

    this.productos = data ?? [];
    this.total = count ?? 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.recalcularPaginas();

    this.actualizarBreadcrumbs();
    this.loading = false;
  }

  recalcularPaginas() {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    this.paginasVisibles = pages;
  }

  async seleccionarGrupo(nombre: string) {
    this.grupoActivo = nombre;
    this.subitemActivo = 'Todos';

    const g = this.grupos.find(x => x.nombre === nombre);
    this.subitems = g ? ['Todos', ...g.items] : [];

    this.page = 1;
    await this.cargarProductos();
  }

  async seleccionarSubitem(nombre: string) {
    this.subitemActivo = nombre;
    this.page = 1;
    await this.cargarProductos();
  }

  async prevPage() {
    if (this.page > 1) {
      this.page--;
      await this.cargarProductos();
    }
  }

  async nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      await this.cargarProductos();
    }
  }

  async goToPage(p: number) {
    this.page = p;
    await this.cargarProductos();
  }

  actualizarBreadcrumbs() {
    this.breadcrumbs = [
      { label: 'Inicio', action: 'home' },
      { label: this.titulo, action: 'categoria' }
    ];

    if (this.grupoActivo !== 'Todos') {
      this.breadcrumbs.push({ label: this.grupoActivo, action: 'grupo' });
    }

    if (this.subitemActivo !== 'Todos') {
      this.breadcrumbs.push({ label: this.subitemActivo, action: 'subitem' });
    }
  }

  navegarCrumb(action: string) {
    if (action === 'home') this.router.navigate(['/']);
    if (action === 'categoria') this.seleccionarGrupo('Todos');
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
}
