'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useThemeV2 } from '@/domain/themes-v2';

interface ThemeButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * CTA button that draws its visual tokens from the active Theme V2.
 * Drop-in for ActionButton in any component that has ThemeProviderV2 in its tree.
 */
export function ThemeButton({
  children,
  className = '',
  href,
  target,
  rel,
  type = 'button',
  disabled,
  onClick,
}: ThemeButtonProps) {
  const theme = useThemeV2();
  const { button } = theme;

  const style: CSSProperties = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    paddingLeft:     button.paddingX,
    paddingRight:    button.paddingX,
    paddingTop:      button.paddingY,
    paddingBottom:   button.paddingY,
    background:      button.background,
    color:           button.text,
    border:          button.border,
    borderRadius:    button.borderRadius,
    boxShadow:       button.shadow,
    fontSize:        '11px',
    letterSpacing:   '0.24em',
    textTransform:   'uppercase',
    fontWeight:      600,
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.55 : 1,
    transition:      'background 0.25s, color 0.25s, box-shadow 0.25s',
  };

  const baseClass = `${theme.button.fontClass} ${className}`.trim();

  if (href) {
    return (
      <a className={baseClass} href={href} target={target} rel={rel} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button className={baseClass} type={type} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
