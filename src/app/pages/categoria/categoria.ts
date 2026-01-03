import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { supabase } from '../../supabase.client';

type CategoriaSlug = 'maquillaje' | 'skincare' | 'capilar' | 'accesorios';

type SubGrupo = { nombre: string; items: string[] };

type CrumbAction = 'home' | 'categoria' | 'grupo' | 'subitem';
type Crumb = { label: string; action: CrumbAction };

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
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.css']
})
export class Categoria implements OnInit {

  titulo = '';
  slugActual: CategoriaSlug = 'maquillaje';

  grupos: SubGrupo[] = [];
  grupoActivo = 'Todos';

  subitems: string[] = [];
  subitemActivo = 'Todos';

  loading = true;
  productosFiltrados: Producto[] = [];

  breadcrumbs: Crumb[] = [];

  // ✅ PAGINACIÓN
  pageSize = 12;        // cambia a 8, 12, 16...
  page = 1;             // página actual (1-based)
  total = 0;            // total productos (según filtro)
  totalPages = 1;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const slug = (params.get('slug') || 'maquillaje') as CategoriaSlug;
      this.slugActual = slug;

      this.cargarCategoria(slug);
      this.cargarGrupos(slug);

      // defaults
      this.grupoActivo = 'Todos';
      this.subitems = [];
      this.subitemActivo = 'Todos';

      // ✅ reset paginación
      this.page = 1;
      this.total = 0;
      this.totalPages = 1;

      this.actualizarBreadcrumbs();
      await this.cargarProductosFiltrados();
    });
  }

  cargarCategoria(slug: CategoriaSlug) {
    switch (slug) {
      case 'maquillaje': this.titulo = 'Maquillaje'; break;
      case 'skincare': this.titulo = 'Cuidado de la piel'; break;
      case 'capilar': this.titulo = 'Cuidado capilar'; break;
      case 'accesorios': this.titulo = 'Accesorios'; break;
    }
  }

  cargarGrupos(slug: CategoriaSlug) {
    if (slug === 'maquillaje') {
      this.grupos = [
        { nombre: 'Rostro', items: ['Bases', 'Bb cream', 'Correctores', 'Polvos', 'Primer', 'Contornos', 'Iluminadores', 'Rubores', 'Bronzer', 'Fijadores'] },
        { nombre: 'Ojos', items: ['Delineadores', 'Pestañinas', 'Sombras', 'Cejas', 'Pestañas postizas'] },
        { nombre: 'Labios', items: ['Bálsamo labial', 'Brillo labial', 'Labial', 'Tinta de labios', 'Delineador de labios'] },
        { nombre: 'Accesorios de maquillaje', items: ['Brochas', 'Cosmetiqueras', 'Encrespadores', 'Esponjas y aplicadores'] },
        { nombre: 'Otros', items: ['Kits de maquillaje', 'Complementos'] }
      ];
      return;
    }

    if (slug === 'skincare') {
      this.grupos = [
        { nombre: 'Cuidado facial', items: ['Limpiadores y desmaquillantes', 'Aguas micelares y tónicos', 'Mascarillas', 'Hidratantes y tratamientos', 'Contorno de ojos', 'Exfoliantes faciales', 'Kits'] },
        { nombre: 'Protección solar', items: ['Protector solar', 'Bronceadores'] },
        { nombre: 'Otros cuidado', items: ['Depilación', 'Masajeadores'] }
      ];
      return;
    }

    if (slug === 'capilar') {
      this.grupos = [
        { nombre: 'Limpieza y tratamientos', items: ['Shampoo', 'Acondicionador', 'Mascarillas y tratamientos', 'Serum y óleos'] },
        { nombre: 'Styling', items: ['Cremas de peinar y desenredantes', 'Fijadores y laca', 'Termoprotectores', 'Mousse y espumas', 'Shampoo seco'] },
        { nombre: 'Eléctricos', items: ['Cepillos eléctricos', 'Planchas', 'Rizadores', 'Secadores'] }
      ];
      return;
    }

    if (slug === 'accesorios') {
      this.grupos = [
        { nombre: 'Accesorios', items: ['Collares', 'Aretes', 'Manillas'] }
      ];
      return;
    }

    this.grupos = [];
  }

  // ✅ SUPABASE + PAGINACIÓN
  async cargarProductosFiltrados() {
    this.loading = true;

    const from = (this.page - 1) * this.pageSize;
    const to = from + this.pageSize - 1;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' }) // ✅ devuelve count total
      .eq('categoria', this.slugActual)
      .order('created_at', { ascending: false });

    if (this.grupoActivo !== 'Todos') {
      query = query.eq('grupo', this.grupoActivo);
    }

    if (this.grupoActivo !== 'Todos' && this.subitemActivo !== 'Todos') {
      query = query.eq('subgrupo', this.subitemActivo);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error cargando productos:', error);
      this.productosFiltrados = [];
      this.total = 0;
      this.totalPages = 1;
      this.loading = false;
      return;
    }

    this.productosFiltrados = (data ?? []) as Producto[];
    this.total = count ?? 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));

    // por seguridad si quedas en una página que ya no existe (cambió filtro)
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
      this.loading = false;
      await this.cargarProductosFiltrados();
      return;
    }

    this.loading = false;
  }

  // ✅ UI filtros (resetean paginación)
  async seleccionarGrupo(nombre: string) {
    this.grupoActivo = nombre;

    // reset subitems
    if (nombre === 'Todos') {
      this.subitems = [];
      this.subitemActivo = 'Todos';
    } else {
      const g = this.grupos.find(x => x.nombre === nombre);
      this.subitems = ['Todos', ...(g?.items ?? [])];
      this.subitemActivo = 'Todos';
    }

    // reset paginación
    this.page = 1;

    this.actualizarBreadcrumbs();
    await this.cargarProductosFiltrados();
  }

  async seleccionarSubitem(nombre: string) {
    this.subitemActivo = nombre;
    this.page = 1;
    this.actualizarBreadcrumbs();
    await this.cargarProductosFiltrados();
  }

  // ✅ PAGINACIÓN CONTROLES
  async prevPage() {
    if (this.page <= 1) return;
    this.page--;
    await this.cargarProductosFiltrados();
  }

  async nextPage() {
    if (this.page >= this.totalPages) return;
    this.page++;
    await this.cargarProductosFiltrados();
  }

  async goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    await this.cargarProductosFiltrados();
  }

  // ========= BREADCRUMB =========
  actualizarBreadcrumbs() {
    const crumbs: Crumb[] = [
      { label: 'Inicio', action: 'home' },
      { label: this.titulo, action: 'categoria' }
    ];

    if (this.grupoActivo !== 'Todos') crumbs.push({ label: this.grupoActivo, action: 'grupo' });
    if (this.grupoActivo !== 'Todos' && this.subitemActivo !== 'Todos') crumbs.push({ label: this.subitemActivo, action: 'subitem' });

    this.breadcrumbs = crumbs;
  }

  async navegarCrumb(action: CrumbAction) {
    if (action === 'home') {
      this.router.navigate(['/']);
      return;
    }

    if (action === 'categoria') {
      this.grupoActivo = 'Todos';
      this.subitems = [];
      this.subitemActivo = 'Todos';
      this.page = 1;
      this.actualizarBreadcrumbs();
      await this.cargarProductosFiltrados();
      return;
    }

    if (action === 'grupo') {
      this.subitemActivo = 'Todos';
      this.page = 1;
      this.actualizarBreadcrumbs();
      await this.cargarProductosFiltrados();
      return;
    }
  }

  verProducto(id: string) {
    console.log('Producto:', id);
  }
}
