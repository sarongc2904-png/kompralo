import Image from 'next/image';
import { TESTIMONIALS } from '@/data/testimonials';
import { MOCK_TESTIMONIALS } from '@/data/testimonials.mock';
import { Item, Reveal, Stagger } from '@/components/public/Motion';

const items = TESTIMONIALS.length > 0 ? TESTIMONIALS : MOCK_TESTIMONIALS;
const hasRealTestimonials = TESTIMONIALS.length > 0;

export function TestimonialsSection() {
  return (
    <section className="bg-site-crema py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="site-eyebrow">Experiencias</p>
          <h2 className="site-h2">Parejas que organizaron mejor su boda</h2>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3" gap={0.12} style={{ marginTop: '3.5rem' }}>
          {items.map((item, index) => (
            <Item key={`testimonial-${index}`} style={{ display: 'flex' }}>
              <article className="flex w-full flex-col rounded-2xl border border-site-border-subtle bg-site-blanco p-7 text-left shadow-sm">
                {item.image ? (
                  <div
                    className="relative mb-6 h-16 w-16 overflow-hidden rounded-full border border-site-border-subtle bg-site-crema"
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt ?? ''}
                      fill
                      sizes="64px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col">
                  <p className="m-0 font-site-serif text-xl italic leading-8 text-site-marron">
                    “{item.quote}”
                  </p>
                  {hasRealTestimonials ? (
                    <div className="mt-6 font-site-sans">
                      <p className="m-0 text-sm font-bold text-site-marron">{item.couple}</p>
                      <p className="m-0 mt-1 text-xs uppercase tracking-[0.12em] text-site-marron/55">{item.detail}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
