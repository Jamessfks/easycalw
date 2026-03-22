import React from 'react';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

export default function SetupGuideView({ guideReady = false, guideData = null }) {
    if (guideReady) {
        return <OutputDisplay guideData={guideData} />;
    }
    return <LoadingScreen />;
}
