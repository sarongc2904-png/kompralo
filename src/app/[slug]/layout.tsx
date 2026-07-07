import InvitationFontScope from '@/components/invitation/InvitationFontScope';

export default function RootSlugInvitationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InvitationFontScope>{children}</InvitationFontScope>;
}
