import { Injectable } from '@angular/core';

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
  private items: CartItem[] = this.load();

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.items));
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    const q = Math.max(1, Math.floor(qty || 1));
    const found = this.items.find(i => i.id === item.id);
    if (found) found.qty += q;
    else this.items.push({ ...item, qty: q });
    this.save();
  }

  setQty(id: string, qty: number) {
    const it = this.items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, Math.floor(Number(qty) || 1));
    this.save();
  }

  remove(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  subtotal(): number {
    return this.items.reduce((acc, i) => acc + i.precio * i.qty, 0);
  }

  count(): number {
    return this.items.reduce((acc, i) => acc + i.qty, 0);
  }
}
