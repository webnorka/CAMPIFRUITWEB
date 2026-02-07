import Hero from '../components/Hero';
import SEOHead from '../components/SEOHead';
import { useConfig } from '../context/ConfigContext';

export default function HomePage() {
    const { config } = useConfig();
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": config.businessName || "Campifruit",
        "description": "Frutas y verduras frescas del campo a tu mesa",
        "url": window.location.origin
    };

    return (
        <main className="bg-organic">
            <SEOHead
                description="Frutas y verduras frescas del campo a tu mesa. Productos de temporada, ofertas semanales y envío a domicilio."
                structuredData={structuredData}
            />
            <Hero />
        </main>
    );
}
