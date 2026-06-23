const PLAN_ALIASES: Record<string, string> = {
  basic: 'basic',
  premium: 'premium',
  gold: 'premium',
  deluxe: 'deluxe',
  platinum: 'deluxe',
};

function normalizePlanId(planId: string): string {
  const normalized = planId.trim().toLowerCase();
  return PLAN_ALIASES[normalized] ?? normalized;
}

export function getDashboardAssistantAllowedPlans(): string[] {
  return (process.env.DASHBOARD_ASSISTANT_ALLOWED_PLANS ?? '')
    .split(',')
    .map((plan) => normalizePlanId(plan))
    .filter(Boolean);
}

export function isDashboardAssistantAllowedForPlan(planId?: string | null): boolean {
  if (!planId) return false;

  const allowedPlans = getDashboardAssistantAllowedPlans();

  if (allowedPlans.length === 0) return false;

  return allowedPlans.includes(normalizePlanId(planId));
}

export function isDashboardAssistantEnabled(): boolean {
  return false;
}
