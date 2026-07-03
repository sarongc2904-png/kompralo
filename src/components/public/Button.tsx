import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type SiteButtonVariant = 'primary' | 'secondary';

const variantClassName: Record<SiteButtonVariant, string> = {
  primary: 'site-btn-primary',
  secondary: 'site-btn-secondary',
};

function getSiteButtonClassName(variant: SiteButtonVariant, className?: string) {
  return ['site-btn', variantClassName[variant], className].filter(Boolean).join(' ');
}

type SharedProps = {
  children: ReactNode;
  variant?: SiteButtonVariant;
  className?: string;
};

type SiteButtonProps =
  | (SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (SharedProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string });

export function SiteButton(props: SiteButtonProps) {
  const { children, variant = 'primary', className } = props;
  const resolvedClassName = getSiteButtonClassName(variant, className);

  if ('href' in props && props.href) {
    const { href, children: _children, variant: _variant, className: _className, ...linkProps } = props as SharedProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

    return (
      <Link href={href} className={resolvedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { children: _children, variant: _variant, className: _className, ...buttonProps } = props as SharedProps &
    ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={resolvedClassName} {...buttonProps}>
      {children}
    </button>
  );
}

export { getSiteButtonClassName };
