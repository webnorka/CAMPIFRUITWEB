import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useConfig } from '../context/ConfigContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';

// Lazy-load all pages for code-splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const CheckoutSuccess = lazy(() => import('../pages/CheckoutSuccess'));
const LegalPage = lazy(() => import('../pages/LegalPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function PageLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-forest rounded-full animate-spin" />
        </div>
    );
}

export default function PublicApp() {
    const { config } = useConfig();

    return (
        <div
            className="min-h-screen bg-white flex flex-col"
            style={{
                '--color-accent': config.accentColor,
                '--color-primary': config.primaryColor,
                '--color-secondary': config.secondaryColor,
                '--color-header-text': config.headerTextColor
            }}
        >
            <div className="flex-1">
                <Header />
                <Suspense fallback={<PageLoading />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalogo" element={<CatalogPage />} />
                        <Route path="/producto/:slug" element={<ProductDetailPage />} />
                        <Route path="/cuenta" element={<AccountPage />} />
                        <Route path="/mis-pedidos" element={<OrdersPage />} />
                        <Route path="/favoritos" element={<WishlistPage />} />
                        <Route path="/pedido-confirmado" element={<CheckoutSuccess />} />
                        <Route path="/privacidad" element={<LegalPage type="privacy" />} />
                        <Route path="/terminos" element={<LegalPage type="terms" />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
                <CartModal />
            </div>
            <Footer />
        </div>
    );
}
