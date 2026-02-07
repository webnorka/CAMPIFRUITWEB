import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState({
        businessName: "Campifruit",
        currencySymbol: "",
        whatsappNumber: "",
        defaultCountryPrefix: "",
        heroTitle: "",
        heroSubtitle: "",
        footerDescription: "",
        instagramUrl: "",
        facebookUrl: "",
        footerAddress: "",
        accentColor: "#A3E635",
        primaryColor: "#1A2F1A",
        secondaryColor: "#FAF9F6",
        headerTextColor: "#1A2F1A",
        enableOnlinePayments: false,
        enableWhatsappCheckout: true,
        stripePublishableKey: "",
        loading: true
    });

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('config')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows found

            if (data) {
                setConfig({
                    businessName: data.business_name || "Campifruit",
                    currencySymbol: data.currency_symbol || "",
                    whatsappNumber: data.whatsapp_number || "",
                    defaultCountryPrefix: data.default_country_prefix || "",
                    heroTitle: data.hero_title || "",
                    heroSubtitle: data.hero_subtitle || "",
                    heroImage: data.hero_image || "",
                    showCarousel: data.show_carousel ?? true,
                    carouselSpeed: data.carousel_speed || 3000,
                    footerDescription: data.footer_description || "",
                    instagramUrl: data.instagram_url || "",
                    facebookUrl: data.facebook_url || "",
                    footerAddress: data.footer_address || "",
                    accentColor: data.accent_color || "#A3E635",
                    primaryColor: data.primary_color || "#1A2F1A",
                    secondaryColor: data.secondary_color || "#FAF9F6",
                    headerTextColor: data.header_text_color || "#1A2F1A",
                    enableOnlinePayments: data.enable_online_payments ?? false,
                    enableWhatsappCheckout: data.enable_whatsapp_checkout ?? true,
                    stripePublishableKey: data.stripe_publishable_key || "",
                    loading: false
                });
            } else {
                // Si no hay fila de config, al menos dejamos de cargar con los defaults
                setConfig(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            reportError(err, { component: 'ConfigContext', action: 'fetchConfig' });
            setConfig(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const updateConfig = async (newConfig) => {
        // Map back to snake_case for DB
        const dbConfig = {
            business_name: newConfig.businessName,
            currency_symbol: newConfig.currencySymbol,
            whatsapp_number: newConfig.whatsappNumber,
            default_country_prefix: newConfig.defaultCountryPrefix,
            hero_title: newConfig.heroTitle,
            hero_subtitle: newConfig.heroSubtitle,
            hero_image: newConfig.heroImage,
            show_carousel: newConfig.showCarousel,
            carousel_speed: newConfig.carouselSpeed,
            footer_description: newConfig.footerDescription,
            instagram_url: newConfig.instagramUrl,
            facebook_url: newConfig.facebookUrl,
            footer_address: newConfig.footerAddress,
            accent_color: newConfig.accentColor,
            primary_color: newConfig.primaryColor,
            secondary_color: newConfig.secondaryColor,
            header_text_color: newConfig.headerTextColor,
            enable_online_payments: newConfig.enableOnlinePayments,
            enable_whatsapp_checkout: newConfig.enableWhatsappCheckout,
            stripe_publishable_key: newConfig.stripePublishableKey
        };

        // Optimistic update
        setConfig(prev => ({ ...prev, ...newConfig }));

        // Check if config row exists
        const { count } = await supabase.from('config').select('*', { count: 'exact', head: true });

        let error;
        if (count > 0) {
            // Update first row
            // We need an ID or just update all (there should only be one)
            // Better to fetch ID first or use a known singleton ID approach
            // For now, update any row (limitations apply)
            const { data: existing } = await supabase.from('config').select('id').limit(1).single();
            if (existing) {
                ({ error } = await supabase.from('config').update(dbConfig).eq('id', existing.id));
            }
        } else {
            ({ error } = await supabase.from('config').insert([dbConfig]));
        }

        if (error) {
            reportError(error, { component: 'ConfigContext', action: 'updateConfig' });
            // Revert?
        }
    };

    const resetConfig = async () => {
        setConfig(prev => ({ ...prev, loading: true }));
        await fetchConfig();
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
