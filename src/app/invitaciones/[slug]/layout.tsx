import InvitationFontScope from '@/components/invitation/InvitationFontScope';

export default function InvitacionesSlugLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InvitationFontScope>{children}</InvitationFontScope>;
}
