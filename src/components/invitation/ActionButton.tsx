import type { ReactNode } from 'react';
import type { Theme } from '@/domain/themes/types';

interface ActionButtonProps {
  children: ReactNode;
  theme: Theme;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

export default function ActionButton({
  children,
  theme,
  className = '',
  href,
  target,
  rel,
  type = 'button',
  disabled,
  onClick,
}: ActionButtonProps) {
  const baseClassName = `inline-flex items-center justify-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.24em] font-semibold transition-all duration-300 ${className}`;
  const style = {
    // V2 tokens — injected at root by ThemeProviderV2 inside InvitationRenderer.
    // Falls back gracefully to v1 values for contexts without ThemeProviderV2.
    borderRadius: 'var(--v2-radius-md, ' + theme.borders.radiusMd + 'px)',
    border: 'var(--v2-btn-border, 1px solid ' + theme.borders.subtle + ')',
    color: 'var(--v2-btn-text, ' + theme.colors.textPrimary + ')',
    background: 'var(--v2-btn-bg, ' + theme.colors.surface + ')',
    boxShadow: 'var(--v2-shadow-card, ' + theme.shadows.soft + ')',
  };

  if (href) {
    return (
      <a className={baseClassName} href={href} target={target} rel={rel} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button className={baseClassName} type={type} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
