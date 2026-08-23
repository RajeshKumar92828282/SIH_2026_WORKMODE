import './globals.css';
import { SidebarNav } from '@/components/layout/SidebarNav';

export const metadata = {
  title: 'APIx — Real-time Airfare Price Index for India',
  description: 'Automated CPI-style high-frequency airfare price index engine for institutional consumers (RBI, NSO, MoSPI)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-[#070a12] text-gray-100 antialiased selection:bg-blue-600 selection:text-white">
        <SidebarNav />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
