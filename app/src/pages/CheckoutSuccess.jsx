import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';

export default function CheckoutSuccess() {
    const location = useLocation();
    const { config } = useConfig();
    const orderData = location.state?.orderData;

    return (
        <div className="min-h-[80vh] bg-organic flex items-center justify-center px-6 py-20 pt-32">
            <div className="max-w-lg w-full text-center">
                {/* Success animation */}
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
                    <CheckCircle2 className="w-12 h-12 text-primary-500" />
                </div>

                <h1 className="text-4xl font-display font-black text-forest mb-4 tracking-tight">
                    ¡Pedido Confirmado!
                </h1>
                <p className="text-forest/50 font-bold mb-8">
                    Tu pedido ha sido registrado correctamente. Te contactaremos por WhatsApp para confirmar los detalles.
                </p>

                {orderData && (
                    <div className="bg-forest rounded-[2.5rem] p-8 text-white shadow-xl shadow-forest/20 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <ShoppingBag className="w-5 h-5 text-accent" />
                            <h3 className="font-display font-black">Resumen</h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60 font-bold">Productos</span>
                                <span className="font-black">{orderData.items_count || '—'}</span>
                            </div>
                            {orderData.discount_applied > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-accent font-bold">Descuento</span>
                                    <span className="font-black text-accent">-{formatPrice(orderData.discount_applied, config.currencySymbol)}</span>
                                </div>
                            )}
                            <div className="border-t border-white/10 pt-4 flex justify-between">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Total</span>
                                <span className="text-2xl font-display font-black text-accent">{formatPrice(orderData.total_price, config.currencySymbol)}</span>
                            </div>
                        </div>

                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                            Pedido #{orderData.order_id?.slice(0, 8) || '—'}
                        </div>
                    </div>
                )}

                <Link
                    to="/"
                    className="inline-flex items-center gap-3 btn-primary h-16 px-10 text-sm uppercase tracking-[0.2em]"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a la tienda
                </Link>
            </div>
        </div>
    );
}
