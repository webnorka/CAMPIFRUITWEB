import { Routes, Route } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import HomePage from '../pages/HomePage';
import CatalogPage from '../pages/CatalogPage';
import CheckoutSuccess from '../pages/CheckoutSuccess';
import ProductDetailPage from '../pages/ProductDetailPage';
import AccountPage from '../pages/AccountPage';
import OrdersPage from '../pages/OrdersPage';
import WishlistPage from '../pages/WishlistPage';

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
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalogo" element={<CatalogPage />} />
                    <Route path="/producto/:slug" element={<ProductDetailPage />} />
                    <Route path="/cuenta" element={<AccountPage />} />
                    <Route path="/mis-pedidos" element={<OrdersPage />} />
                    <Route path="/favoritos" element={<WishlistPage />} />
                    <Route path="/pedido-confirmado" element={<CheckoutSuccess />} />
                </Routes>
                <CartModal />
            </div>
            <Footer />
        </div>
    );
}

