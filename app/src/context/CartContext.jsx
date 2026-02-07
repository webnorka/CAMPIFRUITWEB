import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'campifruit_cart';

function loadSavedCart() {
    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(loadSavedCart);
    const [isOpen, setIsOpen] = useState(false);

    // B3: Persist cart to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch { /* quota exceeded — ignore */ }
    }, [items]);

    // Cart key: productId + variantId for unique identification
    const _getCartKey = useCallback((item) => {
        return item.variantId ? `${item.id}-${item.variantId}` : item.id;
    }, []);

    const matchesItem = useCallback((cartItem, id, variantId) => {
        if (variantId) return cartItem.id === id && cartItem.variantId === variantId;
        return cartItem.id === id && !cartItem.variantId;
    }, []);

    const addToCart = useCallback((product) => {
        setItems(prev => {
            const existing = prev.find(item => matchesItem(item, product.id, product.variantId));
            if (existing) {
                return prev.map(item =>
                    matchesItem(item, product.id, product.variantId)
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: product.quantity || 1 }];
        });
    }, [matchesItem]);

    const removeFromCart = useCallback((productId, variantId) => {
        setItems(prev => prev.filter(item => !matchesItem(item, productId, variantId)));
    }, [matchesItem]);

    const updateQuantity = useCallback((productId, quantity, variantId) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                matchesItem(item, productId, variantId) ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart, matchesItem]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        const price = item.onSale ? item.offerPrice : item.price;
        return sum + (price * item.quantity);
    }, 0);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen(prev => !prev);

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            totalPrice,
            isOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            openCart,
            closeCart,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
