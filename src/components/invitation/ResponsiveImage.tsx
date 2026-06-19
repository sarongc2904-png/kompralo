import type { ImgHTMLAttributes } from 'react';

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
}

export default function ResponsiveImage({
  src,
  alt,
  aspectRatio = '4 / 5',
  objectFit = 'cover',
  className = '',
  style,
  ...props
}: ResponsiveImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        style={{ objectFit }}
        {...props}
      />
    </div>
  );
}
