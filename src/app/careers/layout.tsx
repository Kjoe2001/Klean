import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Zelvoo',
  alternates: { canonical: 'https://www.zelvoo.app/careers' },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
