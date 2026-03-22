import React from 'react';
import { Search, Settings, Radio } from 'lucide-react';
import { StatusIndicator } from '../shared/StatusIndicator';
import { cn } from '../../utils/cn';

interface HeaderProps {
    signalStrength: number;
    onSearchChange: (query: string) => void;
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    signalStrength,
    onSearchChange,
    onSettingsClick,
}) => {
    return (
        <header className="h-16 bg-space-800/80 backdrop-blur-md border-b border-accent-cyan/20 px-6 flex items-center justify-between relative z-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/20 border border-accent-cyan/50 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                    <h1 className="font-display text-lg font-semibold text-white tracking-wide">
                        SURVIVOR NETWORK
                    </h1>
                    <p className="text-xs text-gray-400 tracking-widest">
                        EMERGENCY RESCUE COORDINATION
                    </p>
                </div>
            </div>

            {/* Signal Strength */}
            <StatusIndicator strength={signalStrength} />

            {/* Search and Settings */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search survivors..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(
                            'w-64 pl-10 pr-4 py-2 bg-space-700/50 border border-gray-700 rounded-lg',
                            'text-sm text-white placeholder-gray-500',
                            'focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30',
                            'transition-all'
                        )}
                    />
                </div>

                <button
                    onClick={onSettingsClick}
                    className="p-2 rounded-lg hover:bg-space-600 transition-colors"
                >
                    <Settings className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
            </div>
        </header>
    );
};
