import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';

export default function CartBar() {
    const { totalItems, totalPrice, openCart } = useCart();
    const { config } = useConfig();

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-10 left-0 right-0 z-40 px-6 sm:px-12 animate-slide-up">
            <button
                onClick={openCart}
                className="w-full max-w-lg mx-auto flex items-center justify-between bg-forest text-white h-24 px-10 rounded-[2rem] shadow-[0_30px_60px_rgba(26,47,26,0.4)] hover:scale-[1.02] transition-all duration-500 active:scale-95 group border-2 border-white/10 relative overflow-hidden"
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-accent" />

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-accent" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent text-forest text-xs font-black rounded-xl flex items-center justify-center shadow-2xl animate-bounce-short border-2 border-forest">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col items-start translate-y-0.5">
                        <span className="font-display font-black text-xs uppercase tracking-[0.3em] text-accent">Revisar Pedido</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{totalItems} productos en cesta</span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="font-display font-black text-2xl text-white">
                        {formatPrice(totalPrice, config.currencySymbol)}
                    </span>
                </div>
            </button>
        </div>
    );
}
