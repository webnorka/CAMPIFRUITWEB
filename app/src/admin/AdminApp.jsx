import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './AuthProvider';
import { CustomersProvider } from '../context/CustomersContext';
import { PromotionsProvider } from '../context/PromotionsContext';
import { DiscountCodesProvider } from '../context/DiscountCodesContext';
import { ConfirmProvider } from '../components/ConfirmModal';

const AdminPanel = lazy(() => import('./AdminPanel'));

function AdminLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-forest rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Cargando panel...</p>
            </div>
        </div>
    );
}

export default function AdminApp() {
    return (
        <AuthProvider>
            <ConfirmProvider>
                <CustomersProvider>
                    <PromotionsProvider>
                        <DiscountCodesProvider>
                            <Suspense fallback={<AdminLoading />}>
                                <Routes>
                                    <Route
                                        path="*"
                                        element={
                                            <ProtectedRoute>
                                                <AdminPanel />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </Suspense>
                        </DiscountCodesProvider>
                    </PromotionsProvider>
                </CustomersProvider>
            </ConfirmProvider>
        </AuthProvider>
    );
}
