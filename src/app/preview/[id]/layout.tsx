import InvitationFontScope from '@/components/invitation/InvitationFontScope';

export default function PreviewInvitationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InvitationFontScope>{children}</InvitationFontScope>;
}
