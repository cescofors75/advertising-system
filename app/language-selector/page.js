'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export default function LanguageSelectorPage() {
  const router = useRouter();
  const [displayId, setDisplayId] = useState('');
  
  useEffect(() => {
    // Recuperar el ID del display desde localStorage si existe
    const storedDisplayId = localStorage.getItem('display_id');
    if (storedDisplayId) {
      setDisplayId(storedDisplayId);
    } else {
      // Si no existe, crear uno nuevo
      const newDisplayId = `display_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('display_id', newDisplayId);
      setDisplayId(newDisplayId);
    }
  }, []);
  
  const handleLanguageSelect = (langCode) => {
    // Guardar la preferencia de idioma en localStorage
    localStorage.setItem(`language_pref_${displayId}`, langCode);
    localStorage.setItem('language', langCode); // Guardar también en una variable global
    
    // Redirigir de vuelta a la página de display con el nuevo idioma
    router.push(`/display?lang=${langCode}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-slate-700/50 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
          Selecciona tu idioma
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="flex flex-col items-center p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600/50 transition-all transform hover:scale-105"
            >
              <span className="text-4xl mb-2">{lang.flag}</span>
              <span className="text-white font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/display')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

