"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { LiveTicker } from "@/components/layout/LiveTicker";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/lib/store";

export function MainLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useAppStore();
  const isPublicPage = pathname === "/" || pathname === "/login";

  return (
    <>
      <Sidebar />
      <div
        className={`transition-all duration-300 flex flex-col min-h-screen ${
          isPublicPage
            ? "pl-0"
            : isSidebarCollapsed
            ? "pl-20"
            : "pl-20 md:pl-64"
        }`}
      >
        <Header />
        {!isPublicPage && <LiveTicker />}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </>
  );
}
