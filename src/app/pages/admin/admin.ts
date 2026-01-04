import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabase.client';

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

type ProductoForm = {
  nombre: string;
  descripcion: string;
  precio: number | null;
  categoria: CategoriaSlug;
  grupo: string;
  subgrupo: string;
  imagen: string;
  es_nuevo: boolean;
  en_oferta: boolean;
  precio_antes: number | null;
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  loading = true;
  saving = false;
  uploadBusy = false;

  productos: Producto[] = [];

  // Para editar
  editandoId: string | null = null;

  // Preview / imagen
  fileSeleccionado: File | null = null;
  imagenPreviewLocal: string | null = null;

  // Filtros de admin (opcionales)
  filtroCategoria: CategoriaSlug | 'todas' = 'todas';
  busqueda = '';

  form: ProductoForm = this.nuevoForm();

  ngOnInit(): void {
    this.cargarProductos();
  }

  // =========================
  // FORM
  // =========================
  nuevoForm(): ProductoForm {
    return {
      nombre: '',
      descripcion: '',
      precio: null,
      categoria: 'maquillaje',
      grupo: '',
      subgrupo: '',
      imagen: '',
      es_nuevo: true,
      en_oferta: false,
      precio_antes: null,
    };
  }

  limpiarFormulario() {
    this.editandoId = null;
    this.form = this.nuevoForm();
    this.fileSeleccionado = null;
    this.imagenPreviewLocal = null;
  }

  // =========================
  // LISTAR
  // =========================
  async cargarProductos() {
    this.loading = true;

    let query = supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (this.filtroCategoria !== 'todas') {
      query = query.eq('categoria', this.filtroCategoria);
    }

    if (this.busqueda.trim()) {
      // ilike para buscar en nombre
      query = query.ilike('nombre', `%${this.busqueda.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error cargando productos:', error);
      this.productos = [];
      this.loading = false;
      return;
    }

    this.productos = (data ?? []) as Producto[];
    this.loading = false;
  }

  // =========================
  // IMAGEN
  // =========================
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.fileSeleccionado = file;

    // preview local
    this.imagenPreviewLocal = URL.createObjectURL(file);
  }

  async subirImagenAStorage(file: File) {
    try {
      this.uploadBusy = true;

      const ext = file.name.split('.').pop() || 'png';
      const filePath = `imgs/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('productos')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || 'image/png',
        });

      if (upErr) {
        console.error('Error subiendo imagen:', upErr);
        this.uploadBusy = false;
        return null;
      }

      const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
      this.uploadBusy = false;
      return data.publicUrl;
    } catch (e) {
      console.error('Error inesperado subiendo imagen:', e);
      this.uploadBusy = false;
      return null;
    }
  }

  // =========================
  // CREAR / ACTUALIZAR
  // =========================
  private validarForm(): string | null {
    if (!this.form.nombre.trim()) return 'El nombre es obligatorio.';
    if (this.form.precio == null || this.form.precio <= 0) return 'El precio debe ser mayor a 0.';
    if (!this.form.categoria) return 'La categoría es obligatoria.';
    if (!this.form.grupo.trim()) return 'El grupo es obligatorio.';
    if (!this.form.subgrupo.trim()) return 'El subgrupo es obligatorio.';

    if (this.form.en_oferta) {
      if (this.form.precio_antes == null || this.form.precio_antes <= this.form.precio) {
        return 'Si está en oferta, el precio anterior debe ser mayor que el precio actual.';
      }
    }

    return null;
  }

  async guardar() {
    const errorValidacion = this.validarForm();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    this.saving = true;

    // 1) si hay archivo seleccionado, lo subimos y seteamos url pública
    if (this.fileSeleccionado) {
      const url = await this.subirImagenAStorage(this.fileSeleccionado);
      if (!url) {
        alert('No se pudo subir la imagen.');
        this.saving = false;
        return;
      }
      this.form.imagen = url;
    }

    // 2) payload
    const payload = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion?.trim() || null,
      precio: Number(this.form.precio),
      categoria: this.form.categoria,
      grupo: this.form.grupo.trim(),
      subgrupo: this.form.subgrupo.trim(),
      imagen: this.form.imagen || null,
      es_nuevo: this.form.es_nuevo,
      en_oferta: this.form.en_oferta,
      precio_antes: this.form.en_oferta ? (this.form.precio_antes ?? null) : null,
    };

    // 3) insert o update
    if (!this.editandoId) {
      const { error } = await supabase.from('productos').insert(payload);
      if (error) {
        console.error('Error creando producto:', error);
        alert('❌ Error creando producto: ' + error.message);
        this.saving = false;
        return;
      }
      alert('✅ Producto creado');
    } else {
      const { error } = await supabase.from('productos').update(payload).eq('id', this.editandoId);
      if (error) {
        console.error('Error actualizando producto:', error);
        alert('❌ Error actualizando: ' + error.message);
        this.saving = false;
        return;
      }
      alert('✅ Producto actualizado');
    }

    this.saving = false;
    this.limpiarFormulario();
    await this.cargarProductos();
  }

  // =========================
  // EDITAR / ELIMINAR
  // =========================
  editar(p: Producto) {
    this.editandoId = p.id;

    this.form = {
      nombre: p.nombre || '',
      descripcion: (p.descripcion ?? '') as string,
      precio: p.precio ?? null,
      categoria: p.categoria,
      grupo: (p.grupo ?? '') as string,
      subgrupo: (p.subgrupo ?? '') as string,
      imagen: (p.imagen ?? '') as string,
      es_nuevo: !!p.es_nuevo,
      en_oferta: !!p.en_oferta,
      precio_antes: p.precio_antes ?? null,
    };

    this.fileSeleccionado = null;
    this.imagenPreviewLocal = null;

    // subir a la parte de arriba (form)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async eliminar(p: Producto) {
    const ok = confirm(`¿Eliminar "${p.nombre}"?`);
    if (!ok) return;

    const { error } = await supabase.from('productos').delete().eq('id', p.id);

    if (error) {
      console.error('Error eliminando:', error);
      alert('❌ Error eliminando: ' + error.message);
      return;
    }

    alert('✅ Producto eliminado');
    await this.cargarProductos();
  }

  // =========================
  // UI helpers
  // =========================
  async aplicarFiltro() {
    await this.cargarProductos();
  }
}
