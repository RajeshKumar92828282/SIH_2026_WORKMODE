import { create } from "zustand";

export interface UserSession {
  name: string;
  email: string;
  role: "admin" | "institutional_consumer" | "analyst";
  organization: string;
  apiKey: string;
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
  login: (user: UserSession) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => {
  // Read initial auth state from localStorage if in browser
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("apix_user_session") : null;
  const initialSession = storedUser ? JSON.parse(storedUser) : null;

  return {
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

    isAuthenticated: !!initialSession,
    session: initialSession,

    login: (user: UserSession) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("apix_user_session", JSON.stringify(user));
      }
      set({ isAuthenticated: true, session: user });
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("apix_user_session");
      }
      set({ isAuthenticated: false, session: null });
    }
  };
});
