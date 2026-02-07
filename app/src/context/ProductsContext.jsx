import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Normalizar de snake_case (DB) a camelCase (Frontend)
            const normalizedData = (data || []).map(p => ({
                ...p,
                offerPrice: p.offer_price,
                onSale: p.on_sale,
                familyId: p.family_id,
                slug: p.slug || p.id
            }));

            setProducts(normalizedData);
        } catch (err) {
            reportError(err, { component: 'ProductsContext', action: 'fetchProducts' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (product) => {
        // Normalizar de camelCase (frontend) a snake_case (DB)
        const productToInsert = {
            id: crypto.randomUUID(), // Generate ID client-side if DB default is missing
            name: product.name,
            description: product.description,
            price: Number(product.price) || 0,
            offer_price: Number(product.offerPrice) || 0,
            on_sale: !!product.onSale,
            category: product.category,
            family_id: product.familyId || null,
            image: product.image,
            weight: product.weight,
            stock: product.stock ? Number(product.stock) : null,
            sku: product.sku || null,
            has_variants: !!product.has_variants
        };

        const { data, error } = await supabase
            .from('products')
            .insert([productToInsert])
            .select();

        if (error) {
            reportError(error, { component: 'ProductsContext', action: 'addProduct' });
            throw error;
        }
        setProducts(prev => [data[0], ...prev]);
        return data[0];
    };

    const editProduct = async (id, updatedProduct) => {
        // Normalizar de camelCase a snake_case
        const productToUpdate = { ...updatedProduct };

        if ('onSale' in productToUpdate) {
            productToUpdate.on_sale = productToUpdate.onSale;
            delete productToUpdate.onSale;
        }
        if ('offerPrice' in productToUpdate) {
            productToUpdate.offer_price = productToUpdate.offerPrice;
            delete productToUpdate.offerPrice;
        }
        if ('familyId' in productToUpdate) {
            productToUpdate.family_id = productToUpdate.familyId || null;
            delete productToUpdate.familyId;
        }
        if ('stock' in productToUpdate) {
            productToUpdate.stock = productToUpdate.stock ? Number(productToUpdate.stock) : null;
        }

        const { error } = await supabase
            .from('products')
            .update(productToUpdate)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'ProductsContext', action: 'editProduct', meta: { id } });
            throw error;
        }
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    };

    const deleteProduct = async (id) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'ProductsContext', action: 'deleteProduct', meta: { id } });
            throw error;
        }
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const batchUpdateProducts = async (ids, updates) => {
        // Normalizar para batch
        const normalizedUpdates = { ...updates };
        if ('onSale' in normalizedUpdates) {
            normalizedUpdates.on_sale = normalizedUpdates.onSale;
            delete normalizedUpdates.onSale;
        }
        if ('offerPrice' in normalizedUpdates) {
            normalizedUpdates.offer_price = normalizedUpdates.offerPrice;
            delete normalizedUpdates.offerPrice;
        }

        const { error } = await supabase
            .from('products')
            .update(normalizedUpdates)
            .in('id', ids);

        if (error) {
            reportError(error, { component: 'ProductsContext', action: 'batchUpdate', meta: { count: ids.length } });
            throw error;
        }
        setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
    };

    const batchDeleteProducts = async (ids) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .in('id', ids);

        if (error) {
            reportError(error, { component: 'ProductsContext', action: 'batchDelete', meta: { count: ids.length } });
            throw error;
        }
        setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    };

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

    return (
        <ProductsContext.Provider value={{
            products,
            categories,
            loading,
            addProduct,
            editProduct,
            deleteProduct,
            batchUpdateProducts,
            batchDeleteProducts,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
}

