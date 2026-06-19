import type { Metadata } from 'next';
import {
  generatePublicInvitationMetadata,
  PublicInvitationRoute,
} from '@/components/invitation/PublicInvitationRoute';

interface PublicInvitationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicInvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generatePublicInvitationMetadata(slug);
}

export default async function PublicInvitationPage({ params }: PublicInvitationPageProps) {
  const { slug } = await params;
  return <PublicInvitationRoute slug={slug} />;
}
