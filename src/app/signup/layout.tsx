import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Your Free Trial — 30 Credits, No Card Required | Zelvoo',
  description:
    'Create your Zelvoo account in seconds with Google or Microsoft. 7 days free, 30 credits, no credit card required.',
  alternates: { canonical: 'https://www.zelvoo.app/signup' },
  robots: { index: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
