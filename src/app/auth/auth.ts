import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import type { User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class Auth {
  user: User | null = null;

  async init() {
    const { data } = await supabase.auth.getSession();
    this.user = data.session?.user ?? null;

    supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user ?? null;
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    return data.user;
  }

  async logout() {
    await supabase.auth.signOut();
    this.user = null;
  }

  isLoggedIn() {
    return !!this.user;
  }
}
