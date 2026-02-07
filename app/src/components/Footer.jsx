import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { Link } from 'react-router-dom';

export default function Footer() {
    const { config } = useConfig();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-forest text-white pt-24 pb-12 px-6 sm:px-12 lg:px-20 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <img src="/logo_text.png" alt={config.businessName} className="h-12 w-auto brightness-0 invert" loading="lazy" />
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs font-medium">
                            {config.footerDescription || "Llevamos la esencia vibrante del campo directo a tu puerta. Calidad premium, cosecha seleccionada y compromiso con lo local."}
                        </p>
                        <div className="flex items-center gap-4">
                            {config.instagramUrl && (
                                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent hover:text-forest transition-all">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {config.facebookUrl && (
                                <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent hover:text-forest transition-all">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display font-black uppercase tracking-[0.2em] text-xs text-accent mb-8">Empresa</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Inicio</Link></li>
                            <li><Link to="/catalogo" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Catálogo</Link></li>
                            <li><Link to="/cuenta" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Mi Cuenta</Link></li>
                            <li><Link to="/favoritos" className="text-white/60 hover:text-white transition-colors text-sm font-bold">Favoritos</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-display font-black uppercase tracking-[0.2em] text-xs text-accent mb-8">Contacto</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-white/60 text-sm font-medium">{config.footerAddress || "Valle del Cauca, Colombia"}</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-white/60 text-sm font-medium">+{config.defaultCountryPrefix} {config.whatsappNumber}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-display font-black uppercase tracking-[0.2em] text-xs text-accent mb-8">Atención</h4>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">¿Necesitas ayuda?</p>
                            <a
                                href={`https://wa.me/${config.defaultCountryPrefix}${config.whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-accent text-forest font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp Live
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                        &copy; {currentYear} {config.businessName}. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-8">
                        <Link to="/privacidad" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white/50 transition-colors">Privacidad</Link>
                        <Link to="/terminos" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white/50 transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer >
    );
}
