import { TESTIMONIALS } from '@/data/testimonials';
import { MOCK_TESTIMONIALS } from '@/data/testimonials.mock';
import { Item, Reveal, Stagger } from '@/components/public/Motion';

const items = TESTIMONIALS.length > 0 ? TESTIMONIALS : MOCK_TESTIMONIALS;

export function TestimonialsSection() {
  return (
    <section className="cro-section" style={{ background: '#0C0A09' }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Experiencias</p>
          <h2 className="cro-title-xl">Parejas que organizaron mejor su boda</h2>
        </Reveal>

        <Stagger className="cro-grid-3" gap={0.12} style={{ marginTop: '4rem' }}>
          {items.map((item) => (
            <Item key={`${item.couple}-${item.detail}`} style={{ display: 'flex' }}>
              <article className="cro-value-card" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <p className="cro-copy" style={{ margin: 0, fontSize: '1rem' }}>
                  "{item.quote}"
                </p>
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '0.35rem' }}>{item.couple}</h3>
                  <p style={{ margin: 0 }}>{item.detail}</p>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
