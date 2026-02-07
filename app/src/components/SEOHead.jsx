import { Helmet } from 'react-helmet-async';
import { useConfig } from '../context/ConfigContext';

export default function SEOHead({ title, description, image, url, type = 'website', noindex = false, structuredData }) {
    const { config } = useConfig();
    const businessName = config.businessName || 'Campifruit';
    const fullTitle = title ? `${title} | ${businessName}` : businessName;
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:type" content={type} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={businessName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}

            {/* JSON-LD Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
