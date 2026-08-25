import './globals.css';
import { Header } from '@/components/layout/Header';
import { LiveTicker } from '@/components/layout/LiveTicker';
import { Sidebar } from '@/components/layout/Sidebar';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { AuthGuard } from '@/components/layout/AuthGuard';

export const metadata = {
  title: 'APIx — National Airfare Price Index & Flight Telemetry',
  description: 'High-frequency CPI-style airfare price index engine and 3D aeronautical flight telemetry platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#003247] text-white antialiased selection:bg-[#87D6EB] selection:text-[#003247]" suppressHydrationWarning>
        <CustomCursor />
        <AuthGuard>
          <Sidebar />
          <div className="pl-20 md:pl-64 transition-all duration-300 flex flex-col min-h-screen">
            <Header />
            <LiveTicker />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
