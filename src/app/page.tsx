import { redirect } from 'next/navigation';
import DevPlayground from '@/components/invitation/dev/DevPlayground';

export default function Home() {
  if (process.env.NODE_ENV === 'development') {
    return <DevPlayground />;
  }

  redirect('/invitaciones');
}
