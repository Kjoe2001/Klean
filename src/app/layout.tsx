import type { Metadata } from 'next';
import { Poppins, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'], variable: '--font-poppins',
  weight: ['400','500','600','700'], display: 'swap',
  adjustFontFallback: false,
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', adjustFontFallback: false });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', weight: ['500','700'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zelvoo.app'),
  title: {
    default: 'Zelvoo — The AI Marketing Operating System',
    template: '%s | Zelvoo',
  },
  description: "Generate content, images, campaigns and insights. Africa's AI marketing OS for brands, agencies and creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} ${jbmono.variable} font-inter text-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
