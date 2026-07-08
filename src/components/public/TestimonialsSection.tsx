import Image from 'next/image';
import { TESTIMONIALS } from '@/data/testimonials';
import { MOCK_TESTIMONIALS } from '@/data/testimonials.mock';
import { Reveal } from '@/components/public/Motion';

const items = (TESTIMONIALS.length > 0 ? TESTIMONIALS : MOCK_TESTIMONIALS).slice(0, 6);

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
    <section className="bg-site-crema py-14 md:py-18">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="site-eyebrow">Experiencias</p>
          <h2 className="site-h2">Parejas que ya mandaron su invitación por WhatsApp</h2>
          <p className="mx-auto mt-4 max-w-2xl font-site-sans text-base leading-7 text-site-marron/70">
            Opiniones breves de parejas que usaron su invitación para compartir detalles por WhatsApp.
          </p>
        </Reveal>
 
        <div
          className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:-mx-0 md:px-0"
          style={{ scrollbarWidth: 'thin' }}
        >
          {items.map((item, index) => {
            const reviewerName = item.couple;
            const reviewDate = item.detail;
 
            return (
              <article
                key={`testimonial-${index}`}
                className="flex min-h-[260px] w-[82vw] max-w-[340px] shrink-0 snap-start flex-col rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-[0_16px_38px_rgba(31,26,22,0.08)] md:w-[31%] md:min-w-[310px] lg:min-w-[330px]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-black/[0.06] bg-site-crema">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.imageAlt ?? ''}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-site-crema font-site-sans text-sm font-bold text-site-marron">
                          {reviewerName.trim().charAt(0).toUpperCase() || 'K'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 font-site-sans">
                      <p className="m-0 truncate text-sm font-bold leading-5 text-[#1F1F1F]">
                        {reviewerName}
                      </p>
                      <p className="m-0 mt-0.5 line-clamp-1 text-xs leading-5 text-[#666666]">{reviewDate}</p>
                    </div>
                  </div>
                  <GoogleReviewsIcon />
                </div>
 
                <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Calificación de cinco estrellas">
                  <div className="flex text-[15px] leading-none tracking-[0.02em] text-[#F4B400]" aria-hidden="true">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-site-crema px-2.5 py-1 font-site-sans text-[10px] font-bold uppercase tracking-[0.08em] text-site-rosa-antiguo">
                    <VerifiedIcon />
                    Historia
                  </span>
                </div>
 
                <p className="m-0 line-clamp-5 flex-1 font-site-sans text-sm leading-6 text-[#222222]">
                  &quot;{item.quote}&quot;
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
