import Image from 'next/image';
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
          {items.map((item, index) => (
            <Item key={`testimonial-${index}`} style={{ display: 'flex' }}>
              <article className="cro-value-card" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
                {item.image ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 3',
                      overflow: 'hidden',
                      borderBottom: '1px solid rgba(197, 168, 128, 0.18)',
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : null}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p className="cro-copy" style={{ margin: 0, fontSize: '1rem' }}>
                    "{item.quote}"
                  </p>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
