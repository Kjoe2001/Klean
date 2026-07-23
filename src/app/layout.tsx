import type { Metadata } from 'next';
import Script from 'next/script';
import { Unbounded, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteFooter from '@/components/SiteFooter';
import ChatWidget from '@/components/ChatWidget';

const unbounded = Unbounded({
  subsets: ['latin'], variable: '--font-unbounded',
  weight: ['400', '500', '600', '700'], display: 'swap',
  adjustFontFallback: false,
});
const hanken = Hanken_Grotesk({
  subsets: ['latin'], variable: '--font-hanken',
  weight: ['400', '500'], display: 'swap',
  adjustFontFallback: false,
});
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', weight: ['500','700'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zelvoo.app'),
  title: {
    default: 'Zelvoo — The AI Marketing Operating System',
    template: '%s | Zelvoo',
  },
  description: "AI marketing platform for African brands and agencies. Generate content, campaign strategy, competitor intel, and client-ready reports from one brief.",
  keywords: [
    'AI marketing platform',
    'Africa marketing software',
    'campaign builder',
    'content generation',
    'social media copywriting AI',
    'marketing automation for agencies',
    'Ghana marketing tools',
    'Zelvoo',
  ],
  alternates: {
    canonical: 'https://www.zelvoo.app',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.zelvoo.app',
    siteName: 'Zelvoo',
    title: 'Zelvoo — The AI Marketing Operating System',
    description: 'Create campaigns, content, and insights from one brief with an AI platform built for African brands and agencies.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zelvoo — The AI Marketing Operating System',
    description: 'Campaigns, content, and competitor intel from one brief. Built for African teams.',
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap" />
      </head>
      <body className={`${unbounded.variable} ${hanken.variable} ${jbmono.variable} font-body antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-KV3EVEQDZV" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KV3EVEQDZV');
          `}
        </Script>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
