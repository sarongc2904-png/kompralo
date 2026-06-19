'use client';

import { usePathname } from 'next/navigation';
import { VIRTUAL_ASSISTANT_ENABLED, isVirtualAssistantRoute } from './assistantConfig';
import { VirtualAssistantWidget } from './VirtualAssistantWidget';

export function VirtualAssistantMount() {
  const pathname = usePathname();

  if (!VIRTUAL_ASSISTANT_ENABLED) return null;
  if (!isVirtualAssistantRoute(pathname)) return null;

  return <VirtualAssistantWidget pathname={pathname} />;
}
