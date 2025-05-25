/**
 * Genera una URL de pago basada en el proveedor seleccionado y los detalles del producto
 * @param {string} provider - El proveedor de pago (stripe, googlepay, applepay)
 * @param {string} productName - Nombre del producto
 * @param {number} productPrice - Precio del producto
 * @param {string} returnUrl - URL de retorno después del pago
 * @returns {string} URL para el checkout
 */
export const generatePaymentUrl = (provider, productName, productPrice, returnUrl = typeof window !== 'undefined' ? window.location.origin : '') => {
  // Asegurarse de que el precio es un número y está formateado correctamente
  // Añadir validación para evitar NaN
  const numPrice = parseFloat(productPrice);
  const price = !isNaN(numPrice) ? numPrice.toFixed(2) : "0.00";
  
  // Determinar la URL base (basada en el entorno)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  switch (provider) {
    case 'stripe':
      // URL interna para la simulación de Stripe
      return `${baseUrl}/pay/stripe?product=${encodeURIComponent(productName)}&price=${price}&returnUrl=${encodeURIComponent(returnUrl)}`;
    
    case 'googlepay':
      // URL interna para la simulación de Google Pay
      return `${baseUrl}/pay/google?product=${encodeURIComponent(productName)}&price=${price}&returnUrl=${encodeURIComponent(returnUrl)}`;
    
    case 'applepay':
      // URL interna para la simulación de Apple Pay
      return `${baseUrl}/pay/apple?product=${encodeURIComponent(productName)}&price=${price}&returnUrl=${encodeURIComponent(returnUrl)}`;
    
    default:
      // Si no se especifica un proveedor válido, usar Stripe como valor predeterminado
      return generatePaymentUrl('stripe', productName, productPrice, returnUrl);
  }
};

/**
 * Obtiene un mensaje promocional basado en el precio del producto
 * @param {number} price - Precio del producto
 * @returns {string} Mensaje promocional
 */
export const getPromotionalMessage = (price) => {
  const numPrice = parseFloat(price);
  
  if (numPrice <= 10) {
    return "¡Oferta Especial!";
  } else if (numPrice <= 50) {
    return "¡Precio Exclusivo!";
  } else {
    return "¡Experiencia Premium!";
  }
};

