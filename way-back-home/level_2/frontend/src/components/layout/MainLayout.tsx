import React, { type ReactNode } from 'react';
import { Header } from './Header';
import { StarfieldBackground } from '../shared/StarfieldBackground';
import { useUIStore } from '../../stores/uiStore';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { signalStrength, toggleSettings } = useUIStore();
    const [, setSearchQuery] = React.useState('');

    return (
        <div className="w-screen h-screen overflow-hidden bg-space-900 relative">
            {/* Starfield Background */}
            <StarfieldBackground />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col h-full">
                <Header
                    signalStrength={signalStrength}
                    onSearchChange={setSearchQuery}
                    onSettingsClick={toggleSettings}
                />

                {/* Content Area with explicit height */}
                <main className="flex-1 overflow-hidden min-h-0" style={{ display: 'flex', flexDirection: 'column' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};
