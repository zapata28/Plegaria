import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { ProductCacheService } from './product-cache';

export type CategoriaSlug =
  | 'maquillaje'
  | 'skincare'
  | 'capilar'
  | 'accesorios';

export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria: CategoriaSlug;
  imagen?: string | null;
  es_nuevo?: boolean | null;
  en_oferta?: boolean | null;
  precio_antes?: number | null;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private cache: ProductCacheService) {}

  async getByCategoria(slug: CategoriaSlug): Promise<Producto[]> {
    const key = `categoria_${slug}`;
    const cached = this.cache.get<Producto[]>(key);

    if (cached) return cached;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', slug)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error cargando productos', error);
      return [];
    }

    this.cache.set(key, data ?? []);
    return data ?? [];
  }
}
