import { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import countryPrefixes from '../data/countryPrefixes.json';

export default function ConfigEditor({ setHasUnsavedChanges }) {
    const { config, updateConfig, resetConfig } = useConfig();
    const [formData, setFormData] = useState({ ...config });
    const [saved, setSaved] = useState(false);

    // Track unsaved changes
    useEffect(() => {
        const isDirty = (JSON.stringify(formData) !== JSON.stringify(config)) && !saved;
        if (setHasUnsavedChanges) setHasUnsavedChanges(isDirty);
    }, [formData, config, saved, setHasUnsavedChanges]);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateConfig(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Preferencias del negocio</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personaliza la identidad de tu tienda</p>
                </div>

                <button
                    onClick={resetConfig}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-forest/20 hover:text-forest transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Resetear valores
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Business Name */}
                    <div className="card-bento p-10 bg-white">
                        <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] mb-4 ml-1">
                            Nombre Identitario
                        </label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="input-field text-xl font-black"
                            required
                        />
                    </div>

                    {/* WhatsApp Prefix */}
                    <div className="card-bento p-10 bg-white">
                        <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] mb-4 ml-1">
                            Zona Geográfica (WhatsApp)
                        </label>
                        <select
                            name="defaultCountryPrefix"
                            value={formData.defaultCountryPrefix}
                            onChange={handleChange}
                            className="input-field appearance-none bg-white font-black text-lg"
                        >
                            {Object.entries(
                                countryPrefixes.reduce((acc, p) => {
                                    if (!acc[p.continent]) acc[p.continent] = [];
                                    acc[p.continent].push(p);
                                    return acc;
                                }, {})
                            ).map(([continent, countries]) => (
                                <optgroup key={continent} label={continent.toUpperCase()}>
                                    {countries.map(p => (
                                        <option key={p.code} value={p.code.replace('+', '')}>
                                            {p.flag} {p.country} ({p.code})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="card-bento p-10 bg-white">
                        <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] mb-4 ml-1">
                            Línea de Pedidos
                        </label>
                        <input
                            type="text"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            placeholder="Ej: 3001234567"
                            className="input-field text-xl font-black"
                            required
                        />
                    </div>

                    {/* Currency Symbol */}
                    <div className="card-bento p-10 bg-white">
                        <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] mb-4 ml-1">
                            Divisa / Moneda
                        </label>
                        <input
                            type="text"
                            name="currencySymbol"
                            value={formData.currencySymbol}
                            onChange={handleChange}
                            placeholder="Ej: $"
                            className="input-field text-xl font-black"
                            required
                        />
                    </div>
                </div>

                {/* Hero Text */}
                <div className="card-bento p-10 bg-forest relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Save className="w-40 h-40 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-black text-white mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        Mensaje de Portada (Hero)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Eslogan Principal</label>
                            <input
                                type="text"
                                name="heroTitle"
                                value={formData.heroTitle}
                                onChange={handleChange}
                                className="w-full bg-white/10 border-white/10 text-white rounded-2xl h-16 px-6 outline-none focus:ring-2 focus:ring-accent font-black text-lg"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Texto Secundario</label>
                            <input
                                type="text"
                                name="heroSubtitle"
                                value={formData.heroSubtitle}
                                onChange={handleChange}
                                className="w-full bg-white/10 border-white/10 text-white rounded-2xl h-16 px-6 outline-none focus:ring-2 focus:ring-accent font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Carousel Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card-bento p-10 bg-white">
                        <h3 className="text-xl font-display font-black text-forest mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-accent rounded-full" />
                            Carrusel de Ofertas
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-organic rounded-3xl border border-forest/5">
                                <div>
                                    <p className="text-sm font-black text-forest">Activar Carrusel</p>
                                    <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mt-1">Mostrar productos en oferta</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.showCarousel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, showCarousel: e.target.checked }))}
                                    />
                                    <div className="w-14 h-8 bg-forest/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent focus:ring-0"></div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Velocidad (ms)</label>
                                <input
                                    type="number"
                                    name="carouselSpeed"
                                    value={formData.carouselSpeed}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-bento p-10 bg-white">
                        <h3 className="text-xl font-display font-black text-forest mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-accent rounded-full" />
                            Identidad Visual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Color de Acento (Principal)</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={formData.accentColor || "#A3E635"}
                                        onChange={handleChange}
                                        className="w-16 h-16 rounded-2xl bg-transparent cursor-pointer border-none"
                                    />
                                    <input
                                        type="text"
                                        name="accentColor"
                                        value={formData.accentColor}
                                        onChange={handleChange}
                                        className="input-field font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Color Primario (Forest)</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={formData.primaryColor || "#1A2F1A"}
                                        onChange={handleChange}
                                        className="w-16 h-16 rounded-2xl bg-transparent cursor-pointer border-none"
                                    />
                                    <input
                                        type="text"
                                        name="primaryColor"
                                        value={formData.primaryColor}
                                        onChange={handleChange}
                                        className="input-field font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Color de Fondo (Organic)</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        value={formData.secondaryColor || "#FAF9F6"}
                                        onChange={handleChange}
                                        className="w-16 h-16 rounded-2xl bg-transparent cursor-pointer border-none"
                                    />
                                    <input
                                        type="text"
                                        name="secondaryColor"
                                        value={formData.secondaryColor}
                                        onChange={handleChange}
                                        className="input-field font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Color de Texto (Header)</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="headerTextColor"
                                        value={formData.headerTextColor || "#1A2F1A"}
                                        onChange={handleChange}
                                        className="w-16 h-16 rounded-2xl bg-transparent cursor-pointer border-none"
                                    />
                                    <input
                                        type="text"
                                        name="headerTextColor"
                                        value={formData.headerTextColor}
                                        onChange={handleChange}
                                        className="input-field font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer and Social */}
                <div className="card-bento p-10 bg-white">
                    <h3 className="text-xl font-display font-black text-forest mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        Pie de Página y Redes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Descripción del Footer</label>
                            <textarea
                                name="footerDescription"
                                value={formData.footerDescription}
                                onChange={handleChange}
                                rows={4}
                                className="input-field resize-none py-4"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Dirección Física</label>
                            <input
                                type="text"
                                name="footerAddress"
                                value={formData.footerAddress}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Instagram URL</label>
                            <input
                                type="text"
                                name="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Facebook URL</label>
                            <input
                                type="text"
                                name="facebookUrl"
                                value={formData.facebookUrl}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        className={`min-w-[320px] h-20 flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl transition-all duration-500 active:scale-95 ${saved
                            ? 'bg-white text-forest'
                            : 'btn-primary shadow-primary-500/30'
                            }`}
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-primary-500" />
                                Preferencias guardadas
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                Actualizar Configuración
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
