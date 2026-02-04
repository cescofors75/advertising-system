/**
 * Utilitario para manejar la detección y aplicación de idiomas en la aplicación
 */

// Detectar y aplicar el idioma seleccionado
export function initializeLanguage() {
  if (typeof window === 'undefined') return;
  
  // Verificar si hay un parámetro de idioma en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam && ['es', 'en', 'fr'].includes(langParam)) {
    // Si hay un parámetro de idioma válido en la URL, guardarlo
    const displayId = localStorage.getItem('display_id') || 
      `display_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
    localStorage.setItem('display_id', displayId);
    localStorage.setItem(`language_pref_${displayId}`, langParam);
    
    return langParam;
  } else {
    // Si no hay parámetro en la URL, intentar recuperar del localStorage
    const displayId = localStorage.getItem('display_id');
    if (displayId) {
      const savedLanguage = localStorage.getItem(`language_pref_${displayId}`);
      if (savedLanguage && ['es', 'en', 'fr'].includes(savedLanguage)) {
        return savedLanguage;
      }
    }
  }
  
  return 'es'; // Idioma predeterminado
}

// Obtener traducciones basadas en el idioma actual
export function getTranslation(key, language = 'es', replacements = {}) {
  const translations = {
    'es': {
      // Textos del header
      'header.title': 'Publi-Taxi',
      'header.subtitle': 'Sistema Publicitario Digital',
      // Textos del footer
      'footer.copyright': '© 2025 Publi-Taxi',
      'footer.developed_by': 'Desarrollado en la Costa Brava por VisitToo & VisitTech',
      // Franjas horarias
      'timeSlots.morning': 'Día',
      'timeSlots.afternoon': 'Tarde',
      'timeSlots.night': 'Noche',
      // QR
      'qr.web_info': '¡Escanea para más información!',
      'qr.web_desc': 'Escanea el código QR o visita nuestra web',
      'qr.payment_info': '¡VENTA FLASH: {{product}}!',
      'qr.payment_desc': '{{price}}€ - Pago rápido con {{provider}}',
      'qr.more_info': 'Más Información'
    },
    'en': {
      // Header texts
      'header.title': 'Publi-Taxi',
      'header.subtitle': 'Digital Advertising System',
      // Footer texts
      'footer.copyright': '© 2025 Publi-Taxi',
      'footer.developed_by': 'Developed on the Costa Brava by VisitToo & VisitTech',
      // Time slots
      'timeSlots.morning': 'Morning',
      'timeSlots.afternoon': 'Afternoon',
      'timeSlots.night': 'Night',
      // QR
      'qr.web_info': 'Scan for more information!',
      'qr.web_desc': 'Scan the QR code or visit our website',
      'qr.payment_info': 'FLASH SALE: {{product}}!',
      'qr.payment_desc': '{{price}}€ - Quick payment with {{provider}}',
      'qr.more_info': 'More Information'
    },
    'fr': {
      // Textes d'en-tête
      'header.title': 'Publi-Taxi',
      'header.subtitle': 'Système de Publicité Numérique',
      // Textes de pied de page
      'footer.copyright': '© 2025 Publi-Taxi',
      'footer.developed_by': 'Développé sur la Costa Brava par VisitToo & VisitTech',
      // Créneaux horaires
      'timeSlots.morning': 'Matin',
      'timeSlots.afternoon': 'Après-midi',
      'timeSlots.night': 'Soir',
      // QR
      'qr.web_info': 'Scannez pour plus d\'informations!',
      'qr.web_desc': 'Scannez le code QR ou visitez notre site web',
      'qr.payment_info': 'VENTE FLASH: {{product}}!',
      'qr.payment_desc': '{{price}}€ - Paiement rapide avec {{provider}}',
      'qr.more_info': 'Plus d\'informations'
    }
  };
  
  // Obtener el texto según el idioma o recurrir al texto en español como fallback
  let text = translations[language]?.[key] || translations['es'][key] || key;
  
  // Reemplazar variables en el texto
  if (replacements && typeof replacements === 'object') {
    Object.keys(replacements).forEach(key => {
      text = text.replace(`{{${key}}}`, replacements[key]);
    });
  }
  
  return text;
}

