import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice, generateWhatsAppUrl } from '../utils/whatsapp';
import { supabase } from '../utils/supabaseClient';

export default function CartModal() {
    const { items, isOpen, closeCart, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
    const { config } = useConfig();
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSendWhatsApp = async () => {
        if (!customerName.trim()) {
            alert("Por favor, ingresa tu nombre para completar el pedido.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Guardar en la base de datos de Supabase
            const { error } = await supabase.from('orders').insert([{
                customer_name: customerName,
                items: items,
                total_price: totalPrice,
                notes: notes,
                status: 'nuevo'
            }]);

            if (error) throw error;

            // 2. Abrir WhatsApp
            const url = generateWhatsAppUrl(config, items, customerName, notes);
            window.open(url, '_blank');

            // 3. Limpiar y cerrar
            clearCart();
            closeCart();
            setCustomerName('');
            setNotes('');
            setShowCheckout(false);
        } catch (error) {
            console.error("Error saving order:", error);
            alert("Hubo un error al procesar tu pedido, pero puedes intentarlo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeCart}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl max-h-[92vh] bg-organic rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl animate-slide-up overflow-hidden flex flex-col border border-white/40">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-forest leading-tight">
                                {showCheckout ? 'Finalizar Pedido' : 'Tu Carrito'}
                            </h2>
                            <p className="text-xs font-bold text-forest/40 uppercase tracking-widest mt-0.5">
                                {items.length} {items.length === 1 ? 'Producto' : 'Productos'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-3 hover:bg-white rounded-2xl transition-all text-forest/40 border border-transparent hover:border-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-organic/50">
                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ShoppingBag className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-forest/40 font-bold uppercase tracking-widest text-sm">Tu carrito está vacío</p>
                            <button onClick={closeCart} className="mt-6 text-primary-500 font-bold hover:underline">Ir a comprar</button>
                        </div>
                    ) : showCheckout ? (
                        /* Checkout form */
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black text-forest/40 uppercase tracking-[0.2em] mb-3 ml-1">
                                    Información de Contacto
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                    className="input-field"
                                />
                            </div>

                            <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black text-forest/40 uppercase tracking-[0.2em] mb-3 ml-1">
                                    Notas del Pedido
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Instrucciones especiales, dirección de entrega, etc."
                                    rows={4}
                                    className="input-field resize-none py-4"
                                />
                            </div>

                            {/* Order summary */}
                            <div className="bg-forest rounded-[2.5rem] p-8 text-white shadow-xl shadow-forest/20 mt-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShoppingBag className="w-24 h-24" />
                                </div>
                                <h3 className="font-display font-black text-xl mb-6 relative">Resumen de Compra</h3>
                                <div className="space-y-4 relative">
                                    {items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-white/70 italic"><span className="text-accent font-black not-italic">{item.quantity}x</span> {item.name}</span>
                                            <span className="font-bold">{formatPrice((item.onSale ? item.offerPrice : item.price) * item.quantity, config.currencySymbol)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 pt-6 mt-6 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Total Final</p>
                                            <p className="text-3xl font-display font-black text-accent">{formatPrice(totalPrice, config.currencySymbol)}</p>
                                        </div>
                                        <div className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-full text-white/60">
                                            INCLUYE IMPUESTOS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Cart items */
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-6 bg-white hover:bg-white/80 p-5 rounded-4xl border border-gray-100 transition-all duration-300 group">
                                    {/* Image */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-3xl shadow-sm"
                                        />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-forest text-white text-[10px] font-black rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                                            {item.quantity}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-lg font-black text-forest truncate pr-4">{item.name}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                {formatPrice(item.onSale ? item.offerPrice : item.price, config.currencySymbol)}
                                            </span>
                                            {item.weight && (
                                                <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">{item.weight}</span>
                                            )}
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-1.5 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 self-start">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-10 h-10 flex items-center justify-center bg-white text-forest rounded-xl shadow-sm hover:bg-gray-50 transition-all active:scale-90"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-black text-sm text-forest">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center bg-white text-forest rounded-xl shadow-sm hover:bg-gray-50 transition-all active:scale-90"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-8 border-t border-gray-100 bg-white/50 backdrop-blur-md">
                        {!showCheckout && (
                            <div className="flex justify-between items-end mb-8 px-2">
                                <div>
                                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mb-1">Subtotalestimado</p>
                                    <span className="text-4xl font-display font-black text-forest">
                                        {formatPrice(totalPrice, config.currencySymbol)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Ahorro Aplicado</p>
                                    <p className="text-lg font-black text-primary-500">
                                        -{formatPrice(items.reduce((sum, i) => sum + (i.onSale ? (i.price - i.offerPrice) * i.quantity : 0), 0), config.currencySymbol)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {showCheckout ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="w-full py-5 text-forest/40 font-black uppercase tracking-widest hover:bg-white rounded-3xl transition-all border border-transparent hover:border-gray-200 order-2 sm:order-1"
                                >
                                    Corregir Pedido
                                </button>
                                <button
                                    onClick={handleSendWhatsApp}
                                    disabled={isSaving}
                                    className={`w-full flex items-center justify-center gap-3 font-black py-5 rounded-3xl shadow-2xl transition-all duration-300 active:scale-95 uppercase tracking-widest text-sm order-1 sm:order-2 ${isSaving ? 'bg-forest/50 cursor-not-allowed text-white/50' : 'bg-forest text-white shadow-forest/20 hover:scale-[1.02]'}`}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MessageCircle className="w-5 h-5 text-accent" />
                                    )}
                                    {isSaving ? 'Procesando...' : 'Confirmar por WhatsApp'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCheckout(true)}
                                className="w-full btn-primary group h-20 text-lg uppercase tracking-[0.2em]"
                            >
                                <Check className="w-6 h-6 mr-2" />
                                Continuar con el pedido
                                <ArrowRight className="w-6 h-6 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
