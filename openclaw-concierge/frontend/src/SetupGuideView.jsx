import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

export default function SetupGuideView({ guideReady = false }) {
    if (guideReady) {
        return <OutputDisplay />;
    }
    return <LoadingScreen />;
}
