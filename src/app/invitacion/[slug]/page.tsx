import type { Metadata } from 'next';
import {
  generatePublicInvitationMetadata,
  PublicInvitationRoute,
} from '@/components/invitation/PublicInvitationRoute';

interface PublicInvitationPageProps {
  params:      Promise<{ slug: string }>;
  searchParams: Promise<{ themePreview?: string }>;
}

export async function generateMetadata({ params }: PublicInvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generatePublicInvitationMetadata(slug);
}

export default async function PublicInvitationPage({ params, searchParams }: PublicInvitationPageProps) {
  const { slug }        = await params;
  const { themePreview } = await searchParams;
  return <PublicInvitationRoute slug={slug} themePreviewId={themePreview} />;
}
