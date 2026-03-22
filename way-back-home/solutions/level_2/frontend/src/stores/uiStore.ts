import { create } from 'zustand';

interface UIState {
    signalStrength: number;
    settingsOpen: boolean;
    detailsPanelWidth: number;
    chatPanelHeight: number;

    // Actions
    setSignalStrength: (strength: number) => void;
    toggleSettings: () => void;
    setDetailsPanelWidth: (width: number) => void;
    setChatPanelHeight: (height: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    signalStrength: 4,
    settingsOpen: false,
    detailsPanelWidth: 350,
    chatPanelHeight: 300,

    setSignalStrength: (strength) => set({ signalStrength: strength }),
    toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
    setDetailsPanelWidth: (width) => set({ detailsPanelWidth: width }),
    setChatPanelHeight: (height) => set({ chatPanelHeight: height }),
}));
