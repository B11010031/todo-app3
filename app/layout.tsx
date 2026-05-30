import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] });
export const metadata: Metadata = {
  title: 'TODO',
  description: '代辦事項',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#7B6BE0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={dmSans.className} style={{ margin: 0, padding: 0, background: '#F2F3F9', overflowX: 'hidden', maxWidth: '100vw' }}>{children}</body>
    </html>
  );
}