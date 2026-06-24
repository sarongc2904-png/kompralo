'use client';

import { type CSSProperties, type ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Props {
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export function SignOutButton({ style, className, children = 'Cerrar sesión' }: Props) {
  async function handleClick() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign('/');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', ...style }}
      className={className}
    >
      {children}
    </button>
  );
}
