import { useState } from 'react';
import EasyClawLanding from './EasyClawLanding';
import OpenClawVoiceConcierge from './OpenClawVoiceConcierge';

export default function App() {
    const [view, setView] = useState('landing');

    if (view === 'voice') {
        return <OpenClawVoiceConcierge onBack={() => setView('landing')} />;
    }

    return <EasyClawLanding onStartVoice={() => setView('voice')} />;
}
