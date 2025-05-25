"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function StripeCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Obtener parámetros de la URL
  const productName = searchParams.get('product') || 'Producto';
  const price = searchParams.get('price') || '0.00';
  const returnUrl = searchParams.get('returnUrl') || '/';
  
  // Información de la tarjeta
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta
    if (name === 'number') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardInfo({ ...cardInfo, [name]: formatted.substring(0, 19) });
      return;
    }
    
    // Formatear fecha de expiración
    if (name === 'expiry') {
      const formatted = value
        .replace(/\//g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .trim();
      setCardInfo({ ...cardInfo, [name]: formatted.substring(0, 5) });
      return;
    }
    
    // Limitar CVC a 3 dígitos
    if (name === 'cvc') {
      setCardInfo({ ...cardInfo, [name]: value.substring(0, 3) });
      return;
    }
    
    setCardInfo({ ...cardInfo, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redireccionar después de un pago exitoso
      setTimeout(() => {
        router.push(returnUrl);
      }, 3000);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Stripe Header */}
      <header className="w-full bg-white shadow-md py-4 px-6 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Stripe</div>
          <div className="text-sm text-gray-500">Pago seguro</div>
        </div>
      </header>
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 mb-8">
        {!success ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Completar Pago</h1>
              <p className="text-gray-600">Estás pagando por {productName}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-600">Total a pagar:</p>
                <p className="text-3xl font-bold text-gray-800">{price}€</p>
              </div>
              <div className="text-blue-600 text-sm font-medium px-3 py-1 bg-blue-100 rounded-full">
                Pago único
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Número de tarjeta */}
              <div className="mb-4">
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <input
                  id="number"
                  name="number"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardInfo.number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-4 mb-4">
                {/* Fecha de expiración */}
                <div className="flex-1">
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de expiración
                  </label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    placeholder="MM/AA"
                    value={cardInfo.expiry}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* CVC */}
                <div className="flex-1">
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    name="cvc"
                    type="text"
                    placeholder="123"
                    value={cardInfo.cvc}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {/* Nombre en la tarjeta */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre en la tarjeta
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={cardInfo.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Procesando...' : `Pagar ${price}€`}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Datos de tarjeta de prueba: 4242 4242 4242 4242, cualquier fecha futura, cualquier CVC</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Completado!</h2>
            <p className="text-gray-600 mb-6">
              Has pagado {price}€ por {productName} correctamente.
            </p>
            <p className="text-blue-600">
              Redirigiendo...
            </p>
          </div>
        )}
      </div>
      
      <footer className="w-full py-6 text-center text-gray-500 text-sm">
        <p>© 2025 Stripe Demo | Todos los pagos son simulados</p>
        <p className="mt-2">Desarrollado para el sistema de publicidad digital</p>
      </footer>
    </div>
  );
}

