import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { batchReorder } from '../services/reorderService';
import { reportError } from '../hooks/useErrorReporter';

const FamiliesContext = createContext();

export function FamiliesProvider({ children }) {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFamilies = async () => {
        try {
            const { data, error } = await supabase
                .from('families')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setFamilies(data || []);
        } catch (err) {
            reportError(err, { component: 'FamiliesContext', action: 'fetchFamilies' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    const addFamily = async (family) => {
        const familyToInsert = {
            id: crypto.randomUUID(),
            name: family.name,
            slug: family.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description: family.description || '',
            image: family.image || '',
            sort_order: families.length,
            active: true
        };

        const { data, error } = await supabase
            .from('families')
            .insert([familyToInsert])
            .select();

        if (error) {
            reportError(error, { component: 'FamiliesContext', action: 'addFamily' });
            throw error;
        }
        setFamilies(prev => [...prev, data[0]]);
        return data[0];
    };

    const editFamily = async (id, updatedFamily) => {
        // Generate slug if name changed
        const updates = { ...updatedFamily };
        if (updates.name) {
            updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        const { error } = await supabase
            .from('families')
            .update(updates)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'FamiliesContext', action: 'editFamily', meta: { id } });
            throw error;
        }
        setFamilies(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const deleteFamily = async (id) => {
        const { error } = await supabase
            .from('families')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'FamiliesContext', action: 'deleteFamily', meta: { id } });
            throw error;
        }
        setFamilies(prev => prev.filter(f => f.id !== id));
    };

    const reorderFamilies = async (newOrder) => {
        try {
            await batchReorder('families', newOrder);
            setFamilies(newOrder.map((f, i) => ({ ...f, sort_order: i })));
        } catch (error) {
            reportError(error, { component: 'FamiliesContext', action: 'reorderFamilies' });
            // Revert state if needed, or just log
            // fetchFamilies();
        }
    };

    return (
        <FamiliesContext.Provider value={{
            families,
            loading,
            addFamily,
            editFamily,
            deleteFamily,
            reorderFamilies,
            refreshFamilies: fetchFamilies
        }}>
            {children}
        </FamiliesContext.Provider>
    );
}

export function useFamilies() {
    const context = useContext(FamiliesContext);
    if (!context) {
        throw new Error('useFamilies must be used within a FamiliesProvider');
    }
    return context;
}
