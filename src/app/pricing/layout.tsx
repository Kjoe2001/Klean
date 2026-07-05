import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — AI Marketing Plans from $10 | Zelvoo',
  description:
    'Credit-based plans that scale: Weekly $10, Starter $19/mo, Pro $49, Studio $99, Agency $249. Pay with MTN MoMo, Telecel Cash, AirtelTigo, card or bank transfer. Start free with 30 credits.',
  alternates: { canonical: 'https://www.zelvoo.app/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
