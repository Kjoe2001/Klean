import type { Metadata } from 'next';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600','700','800'], display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', weight: ['500','700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Zelvoo — The AI Marketing Operating System',
  description: "Generate content, images, campaigns and insights. Africa's AI marketing OS for brands, agencies and creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} ${jbmono.variable} font-inter text-ink dark:text-white`}>
        <script dangerouslySetInnerHTML={{ __html:
          `if(localStorage.getItem('zelvo_theme')==='dark')document.documentElement.classList.add('dark')` }} />
        {children}
      </body>
    </html>
  );
}
