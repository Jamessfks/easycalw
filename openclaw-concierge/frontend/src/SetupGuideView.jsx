import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

export default function SetupGuideView({ guideMd, onBack }) {
    if (guideMd) {
        return <OutputDisplay guideMd={guideMd} onBack={onBack} />;
    }
    return <LoadingScreen />;
}
