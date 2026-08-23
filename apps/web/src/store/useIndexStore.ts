import { create } from 'zustand';

interface IndexStoreState {
  selectedRoute: string;
  selectedLeadTime: 'ALL' | 'T+1' | 'T+15';
  selectedCarrier: string;
  apiKeyInput: string;
  setSelectedRoute: (route: string) => void;
  setSelectedLeadTime: (leadTime: 'ALL' | 'T+1' | 'T+15') => void;
  setSelectedCarrier: (carrier: string) => void;
  setApiKeyInput: (key: string) => void;
}

export const useIndexStore = create<IndexStoreState>((set) => ({
  selectedRoute: 'ALL',
  selectedLeadTime: 'ALL',
  selectedCarrier: 'ALL',
  apiKeyInput: '',
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setSelectedLeadTime: (selectedLeadTime) => set({ selectedLeadTime }),
  setSelectedCarrier: (selectedCarrier) => set({ selectedCarrier }),
  setApiKeyInput: (apiKeyInput) => set({ apiKeyInput })
}));
