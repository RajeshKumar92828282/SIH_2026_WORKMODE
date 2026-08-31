import './globals.css';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { MainLayoutContainer } from '@/components/layout/MainLayoutContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APIx — National Airfare Price Index & 3D Flight Telemetry Platform',
  description: 'High-frequency CPI-style airfare price index engine and WebGL 3D aeronautical flight telemetry platform for Reserve Bank of India and NSO analysts.',
  keywords: ['APIx', 'Airfare Index', 'Flight Telemetry', 'CPI Airfare', 'India Flight CPI', 'DGCA Weighted Index', '3D Aeronautical Telemetry'],
  authors: [{ name: 'APIx Engineering Team' }],
  themeColor: '#001826',
  openGraph: {
    title: 'APIx — National Airfare Price Index & 3D Telemetry',
    description: 'High-frequency CPI-style airfare price index engine and WebGL 3D aeronautical flight telemetry platform.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'APIx National Airfare Index'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APIx — National Airfare Price Index',
    description: 'High-frequency CPI-style airfare price index engine and WebGL 3D aeronautical telemetry platform.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#001826] text-white antialiased selection:bg-[#87D6EB] selection:text-[#003247]" suppressHydrationWarning>
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
