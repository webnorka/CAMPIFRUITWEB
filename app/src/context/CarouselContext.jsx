import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { batchReorder } from '../services/reorderService';
import { reportError } from '../hooks/useErrorReporter';

const CarouselContext = createContext();

export function CarouselProvider({ children }) {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSlides = async () => {
        try {
            const { data, error } = await supabase
                .from('carousel_slides')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            // Normalize snake_case to camelCase
            const normalizedData = (data || []).map(slide => ({
                ...slide,
                displayOrder: slide.sort_order,
                productId: slide.product_id,
                ctaText: slide.cta_text,
                ctaUrl: slide.cta_url,
                imageUrl: slide.image
            }));

            setSlides(normalizedData);
        } catch (err) {
            reportError(err, { component: 'CarouselContext', action: 'fetchSlides' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const addSlide = async (slide) => {
        const slideToInsert = {
            id: crypto.randomUUID(),
            title: slide.title,
            subtitle: slide.subtitle || null,
            type: slide.type,
            product_id: slide.productId || null,
            image: slide.imageUrl || null,
            cta_text: slide.ctaText || null,
            cta_url: slide.ctaUrl || null,
            sort_order: slide.displayOrder || 0,
            active: slide.active !== undefined ? slide.active : true
        };

        const { data, error } = await supabase
            .from('carousel_slides')
            .insert([slideToInsert])
            .select();

        if (error) {
            reportError(error, { component: 'CarouselContext', action: 'addSlide' });
            throw error;
        }

        const normalized = {
            ...data[0],
            displayOrder: data[0].sort_order,
            productId: data[0].product_id,
            ctaText: data[0].cta_text,
            ctaUrl: data[0].cta_url,
            imageUrl: data[0].image
        };

        setSlides(prev => [...prev, normalized].sort((a, b) => a.displayOrder - b.displayOrder));
    };

    const editSlide = async (id, updatedSlide) => {
        const slideToUpdate = { ...updatedSlide };

        // Convert camelCase to snake_case
        if ('displayOrder' in slideToUpdate) {
            slideToUpdate.sort_order = slideToUpdate.displayOrder;
            delete slideToUpdate.displayOrder;
        }
        if ('productId' in slideToUpdate) {
            slideToUpdate.product_id = slideToUpdate.productId || null;
            delete slideToUpdate.productId;
        }
        if ('ctaText' in slideToUpdate) {
            slideToUpdate.cta_text = slideToUpdate.ctaText || null;
            delete slideToUpdate.ctaText;
        }
        if ('ctaUrl' in slideToUpdate) {
            slideToUpdate.cta_url = slideToUpdate.ctaUrl || null;
            delete slideToUpdate.ctaUrl;
        }
        if ('imageUrl' in slideToUpdate) {
            slideToUpdate.image = slideToUpdate.imageUrl || null;
            delete slideToUpdate.imageUrl;
        }

        const { error } = await supabase
            .from('carousel_slides')
            .update(slideToUpdate)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'CarouselContext', action: 'editSlide', meta: { id } });
            throw error;
        }

        setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updatedSlide } : s)
            .sort((a, b) => a.displayOrder - b.displayOrder));
    };

    const deleteSlide = async (id) => {
        const { error } = await supabase
            .from('carousel_slides')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'CarouselContext', action: 'deleteSlide', meta: { id } });
            throw error;
        }

        setSlides(prev => prev.filter(s => s.id !== id));
    };

    const reorderSlides = async (reorderedSlides) => {
        try {
            // Map frontend naming (displayOrder) to DB expectations (sort_order) if needed,
            // but batchReorder expects { id, sort_order }
            const itemsToReorder = reorderedSlides.map((slide, index) => ({
                id: slide.id,
                sort_order: index
            }));

            await batchReorder('carousel_slides', itemsToReorder);

            setSlides(reorderedSlides.map((s, idx) => ({ ...s, displayOrder: idx })));
        } catch (error) {
            reportError(error, { component: 'CarouselContext', action: 'reorderSlides' });
            throw error;
        }
    };

    // Get only active slides for frontend display
    const activeSlides = slides.filter(s => s.active);

    return (
        <CarouselContext.Provider value={{
            slides,
            activeSlides,
            loading,
            addSlide,
            editSlide,
            deleteSlide,
            reorderSlides,
            refreshSlides: fetchSlides
        }}>
            {children}
        </CarouselContext.Provider>
    );
}

export function useCarousel() {
    const context = useContext(CarouselContext);
    if (!context) {
        throw new Error('useCarousel must be used within a CarouselProvider');
    }
    return context;
}
