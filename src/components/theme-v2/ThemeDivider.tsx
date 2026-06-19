'use client';

import { useThemeV2 } from '@/domain/themes-v2';

interface ThemeDividerProps {
  className?: string;
  /** Width of the divider line (default: 48px) */
  width?: number | string;
}

/**
 * Decorative section divider that uses the active Theme V2 divider tokens.
 * Supports 'line', 'ornamental', 'dotted', and 'gradient' variants.
 */
export function ThemeDivider({ className = '', width = 48 }: ThemeDividerProps) {
  const theme = useThemeV2();
  const { color, variant, thickness, opacity, ornamentChar } = theme.divider;

  if (variant === 'ornamental' && ornamentChar) {
    return (
      <div
        className={`flex items-center justify-center gap-2 mx-auto ${className}`}
        style={{ width: typeof width === 'number' ? `${width * 3}px` : width }}
        aria-hidden="true"
      >
        <div
          style={{
            flex: 1,
            height: thickness,
            background: `linear-gradient(to right, transparent, ${color})`,
            opacity,
          }}
        />
        <span
          style={{
            color,
            opacity: Math.min(opacity + 0.25, 1),
            fontSize: '0.5rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {ornamentChar}
        </span>
        <div
          style={{
            flex: 1,
            height: thickness,
            background: `linear-gradient(to left, transparent, ${color})`,
            opacity,
          }}
        />
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div
        className={`mx-auto ${className}`}
        aria-hidden="true"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: thickness,
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity,
        }}
      />
    );
  }

  if (variant === 'dotted') {
    return (
      <div
        className={`flex items-center justify-center gap-1.5 mx-auto ${className}`}
        aria-hidden="true"
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: color,
              opacity: opacity - i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  // default: 'line'
  return (
    <div
      className={`mx-auto ${className}`}
      aria-hidden="true"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: thickness,
        background: color,
        opacity,
      }}
    />
  );
}
