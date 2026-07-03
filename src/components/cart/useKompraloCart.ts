'use client';

import { useCallback, useEffect, useState } from 'react';

// ─── Shared cart contract ─────────────────────────────────────────────────────
// Single source of truth for the kompralo_cart localStorage cart. The item
// shape is consumed by /api/checkout/multi — do not change field names.
export interface CartItem {
  id: string;
  eventType: string;
  eventLabel: string;
  eventIcon: string;
  plan: 'basic' | 'premium' | 'deluxe';
  planLabel: string;
  price: number;
}

export type CartPlanId = CartItem['plan'];

export const CART_EVENT_TYPES = [
  { id: 'boda',        label: 'Boda',        icon: '💍' },
  { id: 'xv',         label: 'XV Años',      icon: '👑' },
  { id: 'baby',       label: 'Baby Shower',  icon: '🍼' },
  { id: 'bautizo',    label: 'Bautizo',      icon: '🕊️' },
  { id: 'cumple',     label: 'Cumpleaños',   icon: '🎂' },
  { id: 'graduacion', label: 'Graduación',   icon: '🎓' },
  { id: 'aniversario',label: 'Aniversario',  icon: '💫' },
] as const;

// Tipos de evento con plantillas publicadas y vendibles. El resto del catálogo
// se muestra como "Próximamente" en la UI y se filtra de carritos guardados.
export const AVAILABLE_EVENT_TYPES: readonly string[] = ['boda'];

export const CART_PLANS = {
  basic:   { price: 49900,  label: 'Basic',   desc: 'Esencial' },
  premium: { price: 89900,  label: 'Premium', desc: 'Control Total' },
  deluxe:  { price: 149900, label: 'Deluxe',  desc: 'Experiencia Completa' },
} as const;

export const CART_KEY = 'kompralo_cart';
const CART_CHANGE_EVENT = 'kompralo-cart-changed';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) as CartItem[] : [];
    // Carritos guardados pueden traer tipos de evento que ya no están a la
    // venta (sin plantillas publicadas) — se descartan al leer.
    return items.filter(i => AVAILABLE_EVENT_TYPES.includes(i.eventType));
  } catch {
    return [];
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function buildCartItem(eventTypeId: string, plan: CartPlanId): CartItem {
  const evDef = CART_EVENT_TYPES.find(e => e.id === eventTypeId) ?? CART_EVENT_TYPES[0];
  const plDef = CART_PLANS[plan];
  return {
    id:         uid(),
    eventType:  evDef.id,
    eventLabel: evDef.label,
    eventIcon:  evDef.icon,
    plan,
    planLabel:  plDef.label,
    price:      plDef.price,
  };
}

// Shared cart state: every component using this hook stays in sync via a
// window event (same tab) and the storage event (other tabs).
export function useKompraloCart() {
  // Arranca vacío y lee localStorage tras el mount para no divergir del HTML
  // prerenderizado (evita hydration mismatch en páginas estáticas).
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener(CART_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }, []);

  const addItem = useCallback((eventTypeId: string, plan: CartPlanId) => {
    persist([...readCart(), buildCartItem(eventTypeId, plan)]);
  }, [persist]);

  const removeItem = useCallback((id: string) => {
    persist(readCart().filter(i => i.id !== id));
  }, [persist]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const total = items.reduce((s, i) => s + i.price, 0);

  return { items, total, addItem, removeItem, clear };
}
