import React from 'react';
import useGuideStream from './useGuideStream';
import LoadingScreen from './components/LoadingScreen';
import OutputDisplay from './components/OutputDisplay';

export default function SetupGuideView({ transcriptData, selectedOutputs, onBack, onRestart }) {
    const { guideData, loading, progress } = useGuideStream(transcriptData, selectedOutputs);

    if (loading) {
        return <LoadingScreen progress={progress} />;
    }

    return (
        <OutputDisplay
            guideData={guideData}
            onBack={onBack}
            onRestart={onRestart}
        />
    );
}
