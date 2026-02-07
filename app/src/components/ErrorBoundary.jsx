import React from 'react';
import { reportError } from '../hooks/useErrorReporter';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, showStack: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        reportError(error, {
            component: 'ErrorBoundary',
            action: 'componentDidCatch',
            meta: { componentStack: errorInfo?.componentStack },
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, showStack: false });
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env?.DEV;

            return (
                <div className="min-h-screen bg-organic flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-forest/5">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-display font-black text-forest mb-4">¡Ups! Algo salió mal</h2>
                        <p className="text-forest/50 font-medium mb-4">
                            Ha ocurrido un error inesperado. Puedes intentar recuperarte o recargar la página.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-4 bg-rose-50 rounded-xl text-left border border-rose-100">
                                <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Error Técnico:</p>
                                <code className="text-xs text-rose-600 font-mono break-all">{this.state.error.message || "Error desconocido"}</code>
                            </div>
                        )}

                        {/* Dev-only: expandable stack trace */}
                        {isDev && this.state.error?.stack && (
                            <div className="mb-6">
                                <button
                                    onClick={() => this.setState(s => ({ showStack: !s.showStack }))}
                                    className="text-[10px] font-black text-forest/30 uppercase tracking-widest hover:text-forest/50 transition-colors"
                                >
                                    {this.state.showStack ? '▼ Ocultar Stack' : '▶ Ver Stack Trace'}
                                </button>
                                {this.state.showStack && (
                                    <pre className="mt-2 p-3 bg-gray-50 rounded-xl text-[10px] text-left text-gray-500 font-mono overflow-x-auto max-h-48 border border-gray-100">
                                        {this.state.error.stack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 bg-forest/10 text-forest font-black py-4 rounded-2xl hover:bg-forest/20 transition-all"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-forest text-accent font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Recargar
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
