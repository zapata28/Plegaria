import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../cart.service';
import {
  ProductService,
  CategoriaSlug,
  Producto,
} from '../../services/product.service';

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
    private cart: CartService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const slug = params.get('slug') as CategoriaSlug;

      if (!slug) {
        this.router.navigate(['/']);
        return;
      }

      this.slugActual = slug;
      this.grupoActivo = 'Todos';
      this.subitemActivo = 'Todos';
      this.subitems = [];
      this.page = 1;

      this.setTitulo();
      this.setGrupos();

      await this.cargarProductos();
    });
  }

  setTitulo() {
    const map: Record<CategoriaSlug, string> = {
      maquillaje: 'Maquillaje',
      skincare: 'Cuidado de la piel',
      capilar: 'Cuidado capilar',
      accesorios: 'Accesorios',
    };
    this.titulo = map[this.slugActual];
  }

  /* =================================================
     DEFINICIÓN DE GRUPOS Y SUBGRUPOS (UI)
  ================================================= */
  setGrupos() {
    this.grupos = [];

    /* ===== MAQUILLAJE ===== */
    if (this.slugActual === 'maquillaje') {
      this.grupos = [
        {
          nombre: 'Rostro',
          items: [
            'Bases',
            'BB Cream',
            'Correctores',
            'Polvos',
            'Primer',
            'Contornos',
            'Iluminadores',
            'Rubores',
            'Bronzer',
            'Fijadores',
          ],
        },
        {
          nombre: 'Ojos',
          items: [
            'Delineadores',
            'Pestañinas',
            'Sombras',
            'Cejas',
            'Pestañas postizas',
          ],
        },
        {
          nombre: 'Labios',
          items: [
            'Bálsamo labial',
            'Brillo labial',
            'Labial',
            'Tinta de labios',
            'Delineador de labios',
          ],
        },
        {
          nombre: 'Accesorios de maquillaje',
          items: [
            'Brochas',
            'Cosmetiqueras',
            'Encrespadores',
            'Esponjas y aplicadores',
          ],
        },
        {
          nombre: 'Otros maquillaje',
          items: ['Kits de maquillaje', 'Complementos'],
        },
      ];
    }

    /* ===== SKINCARE ===== */
    if (this.slugActual === 'skincare') {
      this.grupos = [
        {
          nombre: 'Cuidado facial',
          items: [
            'Limpiadores y desmaquillantes',
            'Aguas micelares y tónicos',
            'Mascarillas',
            'Hidratantes y tratamientos',
            'Contorno de ojos',
            'Exfoliantes faciales',
            'Kits',
          ],
        },
        {
          nombre: 'Protección solar',
          items: ['Protector solar', 'Bronceadores'],
        },
        {
          nombre: 'Otros cuidado',
          items: ['Depilación', 'Masajeadores'],
        },
      ];
    }

    /* ===== CAPILAR ===== */
    if (this.slugActual === 'capilar') {
      this.grupos = [
        {
          nombre: 'Limpieza y tratamientos',
          items: [
            'Shampoo',
            'Acondicionador',
            'Mascarillas y tratamientos',
            'Serum y óleos',
          ],
        },
        {
          nombre: 'Styling',
          items: [
            'Cremas de peinar y desenredantes',
            'Fijadores y laca',
            'Termoprotectores',
            'Mousse y espumas',
            'Shampoo seco',
          ],
        },
        {
          nombre: 'Eléctricos',
          items: ['Cepillos eléctricos', 'Planchas', 'Rizadores', 'Secadores'],
        },
      ];
    }

    /* ===== ACCESORIOS ===== */
    if (this.slugActual === 'accesorios') {
      this.grupos = [
        {
          nombre: 'Accesorios',
          items: ['Collares', 'Aretes', 'Manillas'],
        },
      ];
    }
  }

  /* =================================================
     CARGA DE PRODUCTOS (BACKEND)
  ================================================= */
  async cargarProductos() {
    this.loading = true;

    const { data, total } = await this.productService.getByCategoria(
      this.slugActual,
      this.page,
      this.pageSize,
      this.grupoActivo,
      this.subitemActivo
    );

    this.productos = data;
    this.total = total;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));

    this.recalcularPaginas();
    this.actualizarBreadcrumbs();
    this.loading = false;
  }

  recalcularPaginas() {
    this.paginasVisibles = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.paginasVisibles.push(i);
    }
  }

  /* =================================================
     INTERACCIONES UI
  ================================================= */
  async seleccionarGrupo(nombre: string) {
    this.grupoActivo = nombre;
    this.subitemActivo = 'Todos';

    const grupo = this.grupos.find(g => g.nombre === nombre);
    this.subitems = grupo ? ['Todos', ...grupo.items] : ['Todos'];

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
      { label: this.titulo, action: 'categoria' },
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
