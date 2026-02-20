import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-slate-800">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
                    <p className="text-slate-600 mb-6">The application encountered a critical error.</p>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 w-full max-w-lg overflow-auto mb-6">
                        <p className="font-mono text-xs text-red-600 break-words whitespace-pre-wrap">
                            {this.state.error && this.state.error.toString()}
                        </p>
                        <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-slate-400">Stack Trace</summary>
                            <pre className="mt-2 text-[10px] text-slate-500 overflow-x-auto">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
                    >
                        Clear Data & Reset App
                    </button>
                    <p className="mt-4 text-xs text-slate-400">Warning: This will delete your local transactions.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
