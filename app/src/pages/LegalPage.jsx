import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import SEOHead from '../components/SEOHead';

export default function LegalPage({ type }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const titles = {
        privacy: 'Política de Privacidad',
        terms: 'Términos y Condiciones',
    };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const key = type === 'privacy' ? 'privacy_policy' : 'terms_conditions';
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single();

            setContent(data?.value || `Contenido de ${titles[type]} próximamente.`);
            setLoading(false);
        };
        fetchContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    return (
        <main className="bg-organic min-h-screen pt-32 pb-24">
            <SEOHead title={titles[type]} />
            <div className="max-w-3xl mx-auto px-6 sm:px-12">
                <h1 className="text-4xl sm:text-5xl font-display font-black text-forest tracking-tight mb-10">
                    {titles[type]}
                </h1>
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-forest/5 rounded w-full" />
                        <div className="h-4 bg-forest/5 rounded w-5/6" />
                        <div className="h-4 bg-forest/5 rounded w-4/6" />
                    </div>
                ) : (
                    <div className="prose prose-forest max-w-none text-forest/60 leading-relaxed whitespace-pre-wrap font-medium">
                        {content}
                    </div>
                )}
            </div>
        </main>
    );
}
