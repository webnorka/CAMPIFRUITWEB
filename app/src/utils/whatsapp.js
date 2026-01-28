/**
 * Generate WhatsApp URL with encoded message
 * @param {Object} config - Business configuration
 * @param {Array} items - Cart items
 * @param {string} customerName - Optional customer name
 * @param {string} notes - Optional order notes
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppUrl(config, items, customerName = '', notes = '') {
    const { whatsappNumber, defaultCountryPrefix, currencySymbol } = config;

    // Build the phone number (remove any non-digit characters except +)
    const cleanPrefix = defaultCountryPrefix.replace(/[^\d+]/g, '');
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const fullNumber = `${cleanPrefix.replace('+', '')}${cleanNumber}`;

    // Build the message
    let message = '';

    // Greeting with or without name
    if (customerName.trim()) {
        message += `Hola, soy ${customerName.trim()}. Quisiera pedir:\n\n`;
    } else {
        message += `Hola, quisiera pedir:\n\n`;
    }

    // List items with quantities and subtotals
    items.forEach(item => {
        const currentPrice = item.onSale ? item.offerPrice : item.price;
        const subtotal = currentPrice * item.quantity;
        message += `• ${item.quantity}x ${item.name}${item.weight ? ` (${item.weight})` : ''} - ${currencySymbol}${formatNumber(subtotal)}\n`;
    });

    // Add notes if present
    if (notes.trim()) {
        message += `\n📝 Notas: ${notes.trim()}\n`;
    }

    // Add total
    const total = items.reduce((sum, item) => {
        const currentPrice = item.onSale ? item.offerPrice : item.price;
        return sum + (currentPrice * item.quantity);
    }, 0);
    message += `\n💰 *Total: ${currencySymbol}${formatNumber(total)}*`;

    // Encode and build URL
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${fullNumber}?text=${encodedMessage}`;
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toLocaleString('es-CO');
}

/**
 * Format price with currency symbol
 * @param {number} price - Price in cents or units
 * @param {string} symbol - Currency symbol
 * @returns {string} Formatted price
 */
export function formatPrice(price, symbol = '$') {
    return `${symbol}${formatNumber(price)}`;
}
