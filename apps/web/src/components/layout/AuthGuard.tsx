"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setAuthChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/");
      }
    }
  }, [isAuthenticated, pathname, router, authChecked]);

  // If auth not checked yet or unauthenticated and on a protected route, show loading
  if (!authChecked || (!isAuthenticated && pathname !== "/login")) {
    return (
      <div className="min-h-screen bg-[#003247] flex items-center justify-center font-mono text-xs text-slate-400">
        <div className="flex items-center gap-3 p-4 rounded-xl glass-panel border border-[#143159]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#87D6EB] animate-ping"></span>
          <span>AUTHENTICATING INSTITUTIONAL SESSION...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
