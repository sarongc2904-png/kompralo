import InvitationFontScope from '@/components/invitation/InvitationFontScope';

export default function InvitacionSlugLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InvitationFontScope>{children}</InvitationFontScope>;
}
