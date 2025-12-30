import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.css']
})
export class Categoria implements OnInit {

  titulo = '';
  descripcion = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      this.cargarCategoria(slug);
    });
  }

  cargarCategoria(slug: string | null) {
    switch (slug) {
      case 'maquillaje':
        this.titulo = 'Maquillaje';
        this.descripcion = 'Explora todos los productos de Maquillaje.';
        break;

      case 'skincare':
        this.titulo = 'Cuidado de la piel';
        this.descripcion = 'Explora todos los productos de Cuidado de la piel.';
        break;

      case 'capilar':
        this.titulo = 'Cuidado capilar';
        this.descripcion = 'Explora todos los productos de Cuidado capilar.';
        break;

      case 'accesorios':
        this.titulo = 'Accesorios';
        this.descripcion = 'Explora todos los productos de Accesorios.';
        break;

      default:
        this.titulo = '';
        this.descripcion = '';
    }
  }
}
