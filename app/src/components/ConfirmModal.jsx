import { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);

    const confirm = useCallback((message, title = '¿Estás seguro?') => {
        return new Promise((resolve) => {
            setState({ message, title, resolve });
        });
    }, []);

    const handleConfirm = () => {
        state?.resolve(true);
        setState(null);
    };

    const handleCancel = () => {
        state?.resolve(false);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full mx-6 p-8 animate-scale-in">
                        <button
                            onClick={handleCancel}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-all text-forest/30"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-7 h-7 text-amber-600" />
                        </div>

                        <h3 className="text-xl font-display font-black text-forest mb-2">{state.title}</h3>
                        <p className="text-forest/50 font-medium text-sm mb-8 leading-relaxed">{state.message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-4 border border-forest/10 text-forest/50 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
}
