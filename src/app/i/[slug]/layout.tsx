import InvitationFontScope from '@/components/invitation/InvitationFontScope';

export default function PublicInvitationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InvitationFontScope>{children}</InvitationFontScope>;
}
