import type { ReactNode } from 'react';
import { CONTACT, MAILTO_HREF, buildWhatsAppHref } from '@/lib/contact';

/**
 * Piezas compartidas de las páginas informativas/legales del sitio público.
 * Estética Editorial Elegante: crema #FAF3EE, marrón #4A3B35, rosa antiguo
 * #9C6B70, Playfair para display (font-site-serif).
 */

export function InfoHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="border-b border-site-marron/10 bg-site-crema px-6 pb-10 pt-14 text-center md:pb-14 md:pt-20">
      <div className="mx-auto max-w-3xl">
        {eyebrow && (
          <p className="m-0 mb-4 font-site-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-site-rosa-antiguo">
            {eyebrow}
          </p>
        )}
        <h1 className="m-0 font-site-serif text-4xl font-normal leading-tight text-site-marron md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl font-site-sans text-base leading-7 text-site-marron/75 md:text-lg md:leading-8">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

export function LegalArticle({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-[min(760px,calc(100%-48px))] py-12 md:py-16">
      {children}
    </article>
  );
}

export function LegalIntro({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-10 font-site-sans text-base leading-8 text-site-marron/85">
      {children}
    </p>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="m-0 mb-3 font-site-serif text-2xl font-normal text-site-marron">
        {title}
      </h2>
      <div className="flex flex-col gap-4 font-site-sans text-[0.95rem] leading-7 text-site-marron/80">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Bloque de contacto reutilizado al final de las páginas legales. */
export function LegalContactBlock() {
  return (
    <div className="rounded-2xl border border-site-marron/10 bg-white/55 p-6">
      <p className="m-0 font-site-sans text-[0.95rem] leading-7 text-site-marron/80">
        Correo:{' '}
        <a href={MAILTO_HREF} className="font-semibold text-site-rosa-antiguo underline-offset-2 hover:underline">
          {CONTACT.email}
        </a>
        <br />
        WhatsApp:{' '}
        <a
          href={buildWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-site-rosa-antiguo underline-offset-2 hover:underline"
        >
          {CONTACT.whatsappDisplay}
        </a>
      </p>
    </div>
  );
}

export function LegalUpdatedAt({ children }: { children: string }) {
  return (
    <p className="m-0 mt-10 font-site-sans text-xs font-semibold uppercase tracking-[0.15em] text-site-marron/50">
      {children}
    </p>
  );
}
