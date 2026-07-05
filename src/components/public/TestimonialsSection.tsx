import Image from 'next/image';
import { TESTIMONIALS } from '@/data/testimonials';
import { MOCK_TESTIMONIALS } from '@/data/testimonials.mock';
import { Item, Reveal, Stagger } from '@/components/public/Motion';

const items = TESTIMONIALS.length > 0 ? TESTIMONIALS : MOCK_TESTIMONIALS;
const hasRealTestimonials = TESTIMONIALS.length > 0;

function GoogleReviewsIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" role="img">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1-.35-2.1c0-.73.13-1.43.35-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg aria-label="Reseña verificada" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" role="img">
      <circle cx="10" cy="10" r="9" fill="#1A73E8" />
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
          <h2 className="site-h2">Parejas que organizaron mejor su boda</h2>
        </Reveal>
 
        <Stagger
          className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
          gap={0.12}
          style={{ marginTop: '3.5rem' }}
        >
          {items.map((item, index) => {
            const reviewerName = hasRealTestimonials ? item.couple : 'Cliente KOMPRALO';
            const reviewDate = hasRealTestimonials ? item.detail : 'hace 1 año';
 
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
 
                  <div className="mb-5 flex items-center gap-2" aria-label="Calificación de cinco estrellas">
                    <div className="flex text-[18px] leading-none tracking-[0.02em] text-[#F4B400]" aria-hidden="true">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <VerifiedIcon />
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
