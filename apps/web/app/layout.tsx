import './globals.css';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { MainLayoutContainer } from '@/components/layout/MainLayoutContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APIX — Find Cheapest Flights Across India | Live Price Tracker',
  description: 'APIX tracks live flight prices across IndiGo, Air India, Vistara, Akasa & SpiceJet. Updated every 15 seconds. Find the cheapest airfares, set price alerts, and save money — completely free!',
  keywords: ['cheap flights India', 'flight price tracker', 'India airfare', 'cheapest flights', 'IndiGo prices', 'Air India fares', 'flight deals India', 'book cheap flights', 'price alert flights'],
  authors: [{ name: 'India Flight Price Tracker — SIH 2026' }],
  themeColor: '#2563eb',
  openGraph: {
    title: 'India Flight Price Tracker — Find Cheapest Airfares',
    description: 'Track live flight prices across all major Indian airlines. Save money by booking at the right time. Free for everyone!',
    type: 'website',
    locale: 'en_IN',
    siteName: 'India Flight Price Tracker'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India Flight Price Tracker — Find Cheapest Airfares',
    description: 'Check live flight prices updated every 15 seconds across IndiGo, Air India, Vistara, Akasa & SpiceJet. Free!'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f0f7ff] text-[#1a2340] antialiased selection:bg-[#bfdbfe] selection:text-[#1e3a5f]" suppressHydrationWarning>
        <CustomCursor />
        <AuthGuard>
          <MainLayoutContainer>
            {children}
          </MainLayoutContainer>
        </AuthGuard>
      </body>
    </html>
  );
}
