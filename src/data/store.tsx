// Choisit le store : Supabase si .env.local est rempli, sinon le mode démo.
import type { ReactNode } from 'react';
import { isDemoMode } from '../lib/supabase';
import { DemoStoreProvider } from './demoStore';
import { SupabaseStoreProvider } from './supabaseStore';

export function StoreProvider({ children }: { children: ReactNode }) {
  return isDemoMode ? <DemoStoreProvider>{children}</DemoStoreProvider> : <SupabaseStoreProvider>{children}</SupabaseStoreProvider>;
}
