import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from './context/ConfigContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider } from './context/CartContext';
import { FamiliesProvider } from './context/FamiliesContext';
import { CarouselProvider } from './context/CarouselContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';

import PublicApp from './public/PublicApp';
import AdminLogin from './admin/AdminLogin';
import { AuthProvider } from './admin/AuthProvider';

// Lazy load the entire admin app (with its own providers)
const AdminApp = lazy(() => import('./admin/AdminApp'));

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

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ToastProvider>
          <ConfigProvider>
            <ProductsProvider>
              <FamiliesProvider>
                <CarouselProvider>
                  <CartProvider>
                    <CustomerAuthProvider>
                      <WishlistProvider>
                        <Routes>
                          {/* Admin Routes - separate provider tree */}
                          <Route path="/admin/login" element={<AuthProvider><AdminLogin /></AuthProvider>} />
                          <Route
                            path="/admin/*"
                            element={
                              <Suspense fallback={<AdminLoading />}>
                                <AdminApp />
                              </Suspense>
                            }
                          />

                          {/* Public Routes - lightweight provider tree */}
                          <Route path="*" element={<PublicApp />} />
                        </Routes>
                        <Toast />
                      </WishlistProvider>
                    </CustomerAuthProvider>
                  </CartProvider>
                </CarouselProvider>
              </FamiliesProvider>
            </ProductsProvider>
          </ConfigProvider>
        </ToastProvider>
      </Router>
    </HelmetProvider>
  );
}
