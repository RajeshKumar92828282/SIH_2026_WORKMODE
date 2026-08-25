import { create } from "zustand";

export interface UserSession {
  name: string;
  email: string;
  role: "admin" | "analyst";
  organization: string;
}

interface AppState {
  // Navigation & UI
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  show3DHero: boolean;
  toggle3DHero: () => void;
  
  // Filters & State
  selectedTimeframe: "7D" | "30D" | "90D" | "1Y";
  setTimeframe: (tf: "7D" | "30D" | "90D" | "1Y") => void;
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  selectedLeadTime: string;
  setSelectedLeadTime: (lt: string) => void;
  showDgcaBenchmark: boolean;
  toggleDgcaBenchmark: () => void;
  
  // Live Simulation Ticker
  lastTickerUpdate: string;
  triggerTickerUpdate: () => void;

  // Authentication
  isAuthenticated: boolean;
  session: UserSession | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  show3DHero: true,
  toggle3DHero: () => set((state) => ({ show3DHero: !state.show3DHero })),

  selectedTimeframe: "30D",
  setTimeframe: (selectedTimeframe) => set({ selectedTimeframe }),
  selectedRouteId: "ALL",
  setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),
  selectedLeadTime: "ALL",
  setSelectedLeadTime: (selectedLeadTime) => set({ selectedLeadTime }),
  showDgcaBenchmark: true,
  toggleDgcaBenchmark: () => set((state) => ({ showDgcaBenchmark: !state.showDgcaBenchmark })),

  lastTickerUpdate: new Date().toISOString(),
  triggerTickerUpdate: () => set({ lastTickerUpdate: new Date().toISOString() }),

  isAuthenticated: false,
  session: null,

  checkAuth: async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.user) {
          set({ 
            isAuthenticated: true, 
            session: {
              name: data.data.user.email.split('@')[0],
              email: data.data.user.email,
              role: data.data.user.role,
              organization: data.data.user.role === 'admin' ? 'Ministry of Statistics & Programme Implementation (MoSPI)' : 'Reserve Bank of India — Monetary Policy Dept'
            }
          });
          return;
        }
      }
      set({ isAuthenticated: false, session: null });
    } catch {
      set({ isAuthenticated: false, session: null });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/v1/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch {
      // Ignore errors
    }
    set({ isAuthenticated: false, session: null });
  }
}));
