import { Injectable, signal, computed } from '@angular/core';

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  imagen?: string;
  qty: number;
};

const LS_KEY = 'eclipse_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.load());

  // ✅ Signals listos para UI
  itemsSig = computed(() => this._items()); // <- lista reactiva
  countSig = computed(() => this._items().reduce((acc, i) => acc + i.qty, 0));
  subtotalSig = computed(() => this._items().reduce((acc, i) => acc + i.precio * i.qty, 0));

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  // ===== API que ya usas =====
  getItems(): CartItem[] {
    return [...this._items()];
  }

  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    const q = Math.max(1, Math.floor(qty || 1));
    const items = [...this._items()];
    const found = items.find(i => i.id === item.id);

    if (found) found.qty += q;
    else items.push({ ...item, qty: q });

    this._items.set(items);
    this.save(items);
  }

  setQty(id: string, qty: number) {
    const items = [...this._items()];
    const it = items.find(i => i.id === id);
    if (!it) return;

    // ✅ si queda en 0 o menos, lo quitamos
    const newQty = Math.floor(Number(qty) || 0);
    if (newQty <= 0) {
      const filtered = items.filter(x => x.id !== id);
      this._items.set(filtered);
      this.save(filtered);
      return;
    }

    it.qty = newQty;

    this._items.set(items);
    this.save(items);
  }

  remove(id: string) {
    const items = this._items().filter(i => i.id !== id);
    this._items.set(items);
    this.save(items);
  }

  clear() {
    this._items.set([]);
    this.save([]);
  }

  // ===== helpers opcionales =====
  subtotal(): number {
    return this.subtotalSig();
  }

  count(): number {
    return this.countSig();
  }
}
