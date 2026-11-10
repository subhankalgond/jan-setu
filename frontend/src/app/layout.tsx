import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'Jan Setu AI (जन सेतु) | Government Services, Made Simple for Everyone',
  description: 'Intelligent citizen-assistance platform that simplifies access to Indian government schemes and public services. Transparent eligibility, document checklists, and application preparation.',
  keywords: ['Jan Setu', 'GovTech', 'Karnataka Government Schemes', 'SSP Scholarship', 'Gruha Lakshmi', 'Yuva Nidhi', 'Citizen Services India', 'Government Portals Assistance'],
  authors: [{ name: 'Jan Setu GovTech Initiative' }],
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    title: 'Jan Setu AI (जन सेतु) | GovTech Citizen Assistance',
    description: 'Discover government schemes in your own language, check eligibility with transparent deterministic rules, and prepare applications step by step.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="min-h-screen bg-[#F5F5F4] text-[#111111] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[#111111] focus:text-white"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <AuthProvider>
            <AppShell>
              <div id="main-content">
                {children}
              </div>
            </AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
