import type { Metadata } from 'next';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600','700','800'], display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap" />
      </head>
      <body className={`${sora.variable} ${inter.variable} ${jbmono.variable} font-inter text-ink dark:text-white`}>
        <script dangerouslySetInnerHTML={{ __html:
          `if(localStorage.getItem('zelvo_theme')==='dark')document.documentElement.classList.add('dark')` }} />
        {children}
      </body>
    </html>
  );
}
