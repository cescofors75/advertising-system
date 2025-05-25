"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GooglePayCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  
  // Obtener parámetros de la URL
  const productName = searchParams.get('product') || 'Producto';
  const price = searchParams.get('price') || '0.00';
  const returnUrl = searchParams.get('returnUrl') || '/';
  
  const handlePayment = () => {
    setLoading(true);
    
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
  
  const handlePhonePayment = (e) => {
    e.preventDefault();
    handlePayment();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Google Pay Header */}
      <header className="w-full bg-white shadow-md py-4 px-6 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-semibold">
              <span className="text-blue-600">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-400">o</span>
              <span className="text-blue-600">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
              <span className="ml-2 text-gray-700">Pay</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">Pago seguro</div>
        </div>
      </header>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mb-8">
        {!success ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Completar Pago</h1>
              <p className="text-gray-600">{productName}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-600">Total a pagar:</p>
                <p className="text-3xl font-bold text-gray-800">{price}€</p>
              </div>
            </div>
            
            {!showPhoneInput ? (
              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  className={`w-full py-4 px-6 rounded-lg flex items-center justify-center space-x-3 bg-black text-white font-medium transition-all ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                  disabled={loading}
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" fill="#5F6368"/>
                    </svg>
                  </div>
                  <span>{loading ? 'Procesando...' : 'Pagar con Google Pay'}</span>
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <button
                  onClick={() => setShowPhoneInput(true)}
                  className="w-full py-4 px-6 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  Pagar con número de teléfono
                </button>
              </div>
            ) : (
              <form onSubmit={handlePhonePayment}>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de teléfono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+34 612 345 678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full py-4 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : `Verificar y pagar ${price}€`}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPhoneInput(false)}
                  className="w-full mt-3 py-2 text-blue-600 hover:underline"
                >
                  Volver
                </button>
              </form>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo de Google Pay para fines de prueba</p>
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
        <p>© 2025 Google Pay Demo | Todos los pagos son simulados</p>
        <p className="mt-2">Desarrollado para el sistema de publicidad digital</p>
      </footer>
    </div>
  );
}

