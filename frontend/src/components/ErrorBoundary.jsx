import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-surface-0 flex items-center justify-center px-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={28} className="text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white mb-3">
                            Something went wrong
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
