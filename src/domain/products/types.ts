import type { PlanId } from '@/domain/plans/types';

export type ProductId = 'basic' | 'premium' | 'deluxe';

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  /** Amount in the smallest currency unit (e.g. centavos for MXN). */
  price: number;
  currency: string;
  /** The invitation plan unlocked after a successful purchase. */
  planId: PlanId;
  /** Highlights shown on the pricing UI. */
  features: string[];
}
