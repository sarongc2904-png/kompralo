import Image from 'next/image';
import { TESTIMONIALS } from '@/data/testimonials';
import { MOCK_TESTIMONIALS } from '@/data/testimonials.mock';
import { Item, Reveal, Stagger } from '@/components/public/Motion';

const items = TESTIMONIALS.length > 0 ? TESTIMONIALS : MOCK_TESTIMONIALS;

function GoogleReviewsIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 shrink-0 text-site-rosa-antiguo" viewBox="0 0 24 24" role="img">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <path
        d="M8.2 15.3c1.9-.7 2.8-1.9 2.8-3.8V8.7H7.5v3.4h1.7c0 .9-.5 1.5-1.7 2l.7 1.2Zm6 0c1.9-.7 2.8-1.9 2.8-3.8V8.7h-3.5v3.4h1.7c0 .9-.5 1.5-1.7 2l.7 1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg aria-label="Historia de pareja" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" role="img">
      <circle cx="10" cy="10" r="9" fill="#9C6B70" />
      <path
        d="m6.2 10.1 2.4 2.4 5.2-5.4"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-site-crema py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="site-eyebrow">Experiencias</p>
          <h2 className="site-h2">Parejas que ya mandaron su invitación por WhatsApp</h2>
        </Reveal>
 
        <Stagger
          className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
          gap={0.12}
          style={{ marginTop: '3.5rem' }}
        >
          {items.map((item, index) => {
            const reviewerName = item.couple;
            const reviewDate = item.detail;
 
            return (
              <Item key={`testimonial-${index}`} style={{ display: 'flex' }}>
                <article className="group flex w-full flex-col rounded-[22px] border border-black/[0.06] bg-white p-6 text-left shadow-[0_18px_45px_rgba(31,26,22,0.08)] transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,26,22,0.14)] sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/[0.06] bg-site-crema sm:h-14 sm:w-14">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.imageAlt ?? ''}
                            fill
                            sizes="(max-width: 640px) 48px, 56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-site-crema font-site-sans text-base font-bold text-site-marron">
                            {reviewerName.trim().charAt(0).toUpperCase() || 'K'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 font-site-sans">
                        <p className="m-0 truncate text-[15px] font-bold leading-5 text-[#1F1F1F] sm:text-base">
                          {reviewerName}
                        </p>
                        <p className="m-0 mt-1 text-sm leading-5 text-[#666666]">{reviewDate}</p>
                      </div>
                    </div>
                    <GoogleReviewsIcon />
                  </div>
 
                  <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Calificación de cinco estrellas">
                    <div className="flex text-[18px] leading-none tracking-[0.02em] text-[#F4B400]" aria-hidden="true">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-site-crema px-2.5 py-1 font-site-sans text-[11px] font-bold uppercase tracking-[0.08em] text-site-rosa-antiguo">
                      <VerifiedIcon />
                      Historia
                    </span>
                  </div>
 
                  <p className="m-0 flex-1 font-site-sans text-base leading-7 text-[#222222] sm:text-[17px] sm:leading-8">
                    &quot;{item.quote}&quot;
                  </p>
                </article>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
