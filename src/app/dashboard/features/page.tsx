import { redirect } from 'next/navigation';
import { featureRegistry } from '@/domain/features';
import type { FeatureDescriptor, FeatureCategory } from '@/domain/features';

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

export const metadata = { title: 'Features — Kompralo Admin' };

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  core:       'Core',
  engagement: 'Engagement',
  media:      'Media',
  social:     'Social',
  logistics:  'Logística',
  content:    'Contenido',
  ai:         'Inteligencia Artificial',
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'core', 'engagement', 'media', 'social', 'logistics', 'content', 'ai',
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active:     { label: 'Activa',        bg: '#E8F5E9', text: '#388E3C' },
  comingSoon: { label: 'Próximamente',  bg: '#FFF8E1', text: '#F57F17' },
  hidden:     { label: 'Oculta',        bg: '#F3F3F3', text: '#757575' },
};

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
  basic:    { bg: '#F3F3F3', text: '#616161' },
  premium:  { bg: '#FFF8E1', text: '#B8860B' },
  deluxe:   { bg: '#EDE7F6', text: '#512DA8' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span
      style={{
        display:       'inline-block',
        fontSize:      '0.6875rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding:       '0.25rem 0.625rem',
        borderRadius:  '0.375rem',
        fontWeight:    600,
        whiteSpace:    'nowrap',
        background:    bg,
        color:         text,
      }}
    >
      {label}
    </span>
  );
}

// Desktop: table row
function FeatureRow({ feature }: { feature: FeatureDescriptor }) {
  const status = STATUS_BADGE[feature.status] ?? STATUS_BADGE.hidden;
  const plan   = feature.minimumPlan ? PLAN_BADGE[feature.minimumPlan] : null;

  return (
    <tr style={{ borderBottom: '1px solid #F0EBE4' }}>
      {/* Label + description + key */}
      <td style={{ padding: '1rem 1.5rem 1rem 1.5rem', minWidth: 220, verticalAlign: 'top' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1410', margin: '0 0 0.25rem' }}>
          {feature.label}
        </p>
        <p style={{ fontSize: '0.8rem', color: '#6B5B4E', lineHeight: 1.6, margin: '0 0 0.25rem', maxWidth: 300 }}>
          {feature.description}
        </p>
        {feature.planFeatureKey && (
          <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#B0A090', margin: 0 }}>
            {feature.planFeatureKey}
          </p>
        )}
      </td>

      {/* Status */}
      <td style={{ padding: '1rem 1.5rem 1rem 0', verticalAlign: 'top' }}>
        <Badge label={status.label} bg={status.bg} text={status.text} />
      </td>

      {/* Plan */}
      <td style={{ padding: '1rem 1.5rem 1rem 0', verticalAlign: 'top' }}>
        {plan && feature.minimumPlan ? (
          <Badge label={feature.minimumPlan} bg={plan.bg} text={plan.text} />
        ) : (
          <span style={{ fontSize: '0.875rem', color: '#C0B0A0' }}>—</span>
        )}
      </td>

      {/* Flags */}
      <td style={{ padding: '1rem 1.5rem 1rem 0', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {feature.requiresPersistence && (
            <Badge label="Requiere DB" bg="#FBE9E7" text="#BF360C" />
          )}
          {feature.editableByCustomer && (
            <Badge label="Cliente" bg="#E8EAF6" text="#303F9F" />
          )}
          {feature.editableByAdmin && (
            <Badge label="Admin" bg="#E0F2F1" text="#00695C" />
          )}
        </div>
      </td>
    </tr>
  );
}

// Mobile: card per feature
function FeatureCard({ feature }: { feature: FeatureDescriptor }) {
  const status = STATUS_BADGE[feature.status] ?? STATUS_BADGE.hidden;
  const plan   = feature.minimumPlan ? PLAN_BADGE[feature.minimumPlan] : null;

  return (
    <div
      style={{
        padding:      '1.25rem',
        borderBottom: '1px solid #F0EBE4',
      }}
    >
      {/* Name + badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A1410', margin: 0, flexShrink: 0 }}>
          {feature.label}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          <Badge label={status.label} bg={status.bg} text={status.text} />
          {plan && feature.minimumPlan && (
            <Badge label={feature.minimumPlan} bg={plan.bg} text={plan.text} />
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8rem', color: '#6B5B4E', lineHeight: 1.65, margin: '0 0 0.5rem' }}>
        {feature.description}
      </p>

      {/* Bottom row: key + flags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        {feature.planFeatureKey && (
          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#B0A090' }}>
            {feature.planFeatureKey}
          </span>
        )}
        {feature.requiresPersistence && (
          <Badge label="Requiere DB" bg="#FBE9E7" text="#BF360C" />
        )}
        {feature.editableByCustomer && (
          <Badge label="Cliente" bg="#E8EAF6" text="#303F9F" />
        )}
        {feature.editableByAdmin && (
          <Badge label="Admin" bg="#E0F2F1" text="#00695C" />
        )}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  features,
}: {
  category: FeatureCategory;
  features: FeatureDescriptor[];
}) {
  const active = features.filter((f) => f.status === 'active').length;
  const coming = features.filter((f) => f.status === 'comingSoon').length;

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <h2
          style={{
            fontSize:      '0.75rem',
            fontWeight:    700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color:         '#3D2B1A',
            margin:        0,
          }}
        >
          {CATEGORY_LABELS[category]}
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#9B8878' }}>
          {active} activa{active !== 1 ? 's' : ''}
          {coming > 0 ? ` · ${coming} próximamente` : ''}
        </span>
      </div>

      {/* Card — wraps both table (desktop) and card list (mobile) */}
      <div
        style={{
          background:   '#FFFFFF',
          border:       '1px solid #E8E2DA',
          borderRadius: '0.875rem',
          overflow:     'hidden',
        }}
      >
        {/* Desktop table */}
        <div className="hidden md:block" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #EDE8E1' }}>
                {[
                  { label: 'Feature',     pl: '1.5rem' },
                  { label: 'Estado',      pl: 0 },
                  { label: 'Plan mínimo', pl: 0 },
                  { label: 'Flags',       pl: 0 },
                ].map(({ label, pl }) => (
                  <th
                    key={label}
                    style={{
                      padding:       `0.75rem ${pl ? 0 : '1.5rem'} 0.75rem ${pl || 0}`,
                      paddingLeft:   pl || 0,
                      textAlign:     'left',
                      fontSize:      '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight:    600,
                      color:         '#9B8878',
                      whiteSpace:    'nowrap',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <FeatureRow key={f.id} feature={f} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="block md:hidden">
          {features.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  if (!isAdminMode()) redirect('/cliente');

  const totalActive     = featureRegistry.filter((f) => f.status === 'active').length;
  const totalComingSoon = featureRegistry.filter((f) => f.status === 'comingSoon').length;

  const byCategory = CATEGORY_ORDER.reduce<Record<FeatureCategory, FeatureDescriptor[]>>(
    (acc, cat) => {
      acc[cat] = featureRegistry.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<FeatureCategory, FeatureDescriptor[]>,
  );

  return (
    <div style={{ maxWidth: 960, paddingBottom: '3rem' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#1A1410', margin: '0 0 0.5rem' }}>
          Catálogo de Features
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#9B8878', margin: 0 }}>
          {totalActive} activas · {totalComingSoon} próximamente · {featureRegistry.length} en total
        </p>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          flexWrap:     'wrap',
          alignItems:   'center',
          gap:          '0.625rem',
          marginBottom: '2.5rem',
          padding:      '1rem 1.25rem',
          background:   '#FFFFFF',
          border:       '1px solid #E8E2DA',
          borderRadius: '0.875rem',
        }}
      >
        <span
          style={{
            fontSize:      '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color:         '#9B8878',
            marginRight:   '0.25rem',
          }}
        >
          Leyenda:
        </span>
        <Badge label="Activa"       bg="#E8F5E9" text="#388E3C" />
        <Badge label="Próximamente" bg="#FFF8E1" text="#F57F17" />
        <Badge label="Oculta"       bg="#F3F3F3" text="#757575" />
        <Badge label="Requiere DB"  bg="#FBE9E7" text="#BF360C" />
        <Badge label="Cliente"      bg="#E8EAF6" text="#303F9F" />
        <Badge label="Admin"        bg="#E0F2F1" text="#00695C" />
        <Badge label="basic"        bg="#F3F3F3" text="#616161" />
        <Badge label="premium"      bg="#FFF8E1" text="#B8860B" />
        <Badge label="deluxe"       bg="#EDE7F6" text="#512DA8" />
      </div>

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      {CATEGORY_ORDER.map((cat) =>
        byCategory[cat].length > 0 ? (
          <CategorySection key={cat} category={cat} features={byCategory[cat]} />
        ) : null,
      )}
    </div>
  );
}
