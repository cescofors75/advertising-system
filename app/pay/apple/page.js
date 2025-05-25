"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ApplePayCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  
  // Obtener parámetros de la URL
  const productName = searchParams.get('product') || 'Producto';
  const price = searchParams.get('price') || '0.00';
  const returnUrl = searchParams.get('returnUrl') || '/';
  
  const handlePayment = () => {
    setShowBiometric(true);
    
    // Simular verificación biométrica
    setTimeout(() => {
      setLoading(true);
      
      // Simular procesamiento de pago
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        
        // Redireccionar después de un pago exitoso
        setTimeout(() => {
          router.push(returnUrl);
        }, 3000);
      }, 1500);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      {/* Apple Pay Header */}
      <header className="w-full bg-black py-6 px-6 mb-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.04 13.71c-.02-1.46.68-2.77 1.68-3.56-1.59-.7-3.79-.58-5.04.42-1.37 1.08-2.7 2.81-2.23 4.95 1.02 1.01 2.42-.4 3.84-.41 1.35-.01 2.77 1.41 3.75.31-.7-.44-1.99-.92-2-1.71zm-2.7-9.4c.66-.9 1.08-2.14.9-3.31-1.11.06-2.48.78-3.27 1.74-.7.84-1.27 2.13-1.05 3.36 1.2.09 2.48-.53 3.42-1.79z" />
            </svg>
            <span>Pay</span>
          </div>
          <div className="text-sm text-gray-400">Pago seguro</div>
        </div>
      </header>
      
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        {!success ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Pagar con Apple Pay</h1>
              <p className="text-gray-400">{productName}</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-400">Total</div>
                <div className="text-2xl font-semibold">{price}€</div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">Método de pago</div>
                  <div className="flex items-center">
                    <div className="w-8 h-5 bg-gradient-to-r from-gray-300 to-gray-100 rounded mr-2"></div>
                    <span>•••• 1234</span>
                  </div>
                </div>
              </div>
            </div>
            
            {showBiometric ? (
              <div className="text-center py-4 relative">
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-xl">
                  {loading ? (
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-2"></div>
                      <p>Procesando pago...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-black rounded-full border-2 border-gray-700 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8l-8 8m0-8l8 8m-8-4h8" />
                        </svg>
                      </div>
                      <p className="text-xl">Doble clic para autenticar</p>
                    </div>
                  )}
                </div>
                
                <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.7 19.7c-.6-1.2-2-4.7-6.7-4.7-4.7 0-6.1 3.5-6.7 4.7-.1.2 0 .3.2.3h13c.2 0 .3-.1.2-.3z" />
                  </svg>
                </div>
                <p className="text-gray-400">Verificando identidad...</p>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                className="w-full py-4 px-6 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all"
              >
                Pagar con Face ID
              </button>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo de Apple Pay para fines de prueba</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">¡Pago Completado!</h2>
            <p className="text-gray-400 mb-6">
              Has pagado {price}€ por {productName} correctamente.
            </p>
            <div className="inline-block px-4 py-2 bg-gray-800 rounded-full text-blue-400">
              Redirigiendo...
            </div>
          </div>
        )}
      </div>
      
      <footer className="w-full py-6 text-center text-gray-500 text-sm">
        <p>© 2025 Apple Pay Demo | Todos los pagos son simulados</p>
        <p className="mt-2">Desarrollado para el sistema de publicidad digital</p>
      </footer>
    </div>
  );
}

