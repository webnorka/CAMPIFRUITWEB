import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, ProtectedRoute } from './admin/AuthProvider';

import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';

function AppContent() {
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
        <Routes>
          {/* Admin Routes - No header */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Public Routes - With header */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogo" element={<CatalogPage />} />
                </Routes>
                <CartModal />
              </>
            }
          />
        </Routes>
      </div>
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="/admin/login" element={null} />
        <Route path="*" element={<Footer />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ConfigProvider>
        <ProductsProvider>
          <CartProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </CartProvider>
        </ProductsProvider>
      </ConfigProvider>
    </Router>
  );
}
