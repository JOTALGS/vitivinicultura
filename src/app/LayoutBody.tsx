// app/LayoutBody.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function LayoutBody({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const shouldShowHeader = !pathname?.startsWith('/enot-explora/') || 
                         pathname === '/enot-explora';

  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {shouldShowHeader && (
        <header className='absolute w-full bg-transparent'>
          <Header />
        </header>
      )}
      {children}
    </body>
  );
}