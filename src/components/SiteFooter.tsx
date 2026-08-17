'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const LANGUAGES: [string, string][] = [
  ['ar', 'Arabic'], ['bn', 'Bengali'], ['bg', 'Bulgarian'], ['zh-CN', 'Chinese (Simplified)'],
  ['zh-TW', 'Chinese (Traditional)'], ['hr', 'Croatian'], ['cs', 'Czech'], ['da', 'Danish'],
  ['nl', 'Dutch'], ['en', 'English'], ['et', 'Estonian'], ['fi', 'Finnish'], ['fr', 'French'],
  ['de', 'German'], ['el', 'Greek'], ['gu', 'Gujarati'], ['ht', 'Haitian Creole'], ['he', 'Hebrew'],
  ['hi', 'Hindi'], ['hu', 'Hungarian'], ['id', 'Indonesian'], ['it', 'Italian'], ['ja', 'Japanese'],
  ['kn', 'Kannada'], ['ko', 'Korean'], ['lv', 'Latvian'], ['lt', 'Lithuanian'], ['ms', 'Malay'],
  ['ml', 'Malayalam'], ['mr', 'Marathi'], ['no', 'Norwegian'], ['fa', 'Persian'], ['pl', 'Polish'],
  ['pt', 'Portuguese'], ['pa', 'Punjabi'], ['ro', 'Romanian'], ['ru', 'Russian'], ['sr', 'Serbian'],
  ['sk', 'Slovak'], ['sl', 'Slovenian'], ['es', 'Spanish'], ['sw', 'Swahili'], ['sv', 'Swedish'],
  ['ta', 'Tamil'], ['te', 'Telugu'], ['th', 'Thai'], ['tr', 'Turkish'],
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function SiteFooter() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
    };
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleLanguageChange = (lang: string) => {
    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/en/${lang};path=/`;
      window.location.reload();
    }
  };

  return (
    <footer className="section-dark border-t border-mountain-meadow/15 py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-stone text-sm">© 2026 Zelvoo App</p>
        <div className="flex flex-wrap gap-5 text-sm text-pistachio">
          {[
            ['Privacy', '/privacy'],
            ['Careers', '/careers'],
            ['Terms', '/terms'],
            ['Refunds', '/refund-policy'],
            ['Cookies', '/cookies'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex items-center min-h-11 px-1 hover:text-anti-flash-white transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="zelvo-language" className="text-[11px] text-pistachio whitespace-nowrap">Site language</label>
          <select
            id="zelvo-language"
            defaultValue="en"
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-10 rounded-xl border border-mountain-meadow/30 bg-rich-black px-3 text-[12px] text-anti-flash-white outline-none focus:border-caribbean-green"
          >
            {LANGUAGES.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <div id="google_translate_element" className="hidden" />
        </div>
      </div>
    </footer>
  );
}
