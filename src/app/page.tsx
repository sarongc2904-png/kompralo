import DevPlayground from '@/components/invitation/dev/DevPlayground';
import HomePlaceholder from '@/components/home/HomePlaceholder';

export default function Home() {
  if (process.env.NODE_ENV === 'development') {
    return <DevPlayground />;
  }

  return <HomePlaceholder />;
}
