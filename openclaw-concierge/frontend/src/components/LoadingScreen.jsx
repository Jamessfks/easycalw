import React from 'react';
import { Activity } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100 gap-8">
            <Activity className="w-24 h-24 text-cyan-400 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-wider">
                Generating Your Setup Guide...
            </h1>
            <p className="text-gray-400 font-mono text-sm">
                This may take up to 5 minutes. Please don't close this page.
            </p>
            {/* TODO: Add progress indicator */}
        </div>
    );
};

export default LoadingScreen;
