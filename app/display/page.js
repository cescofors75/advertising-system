

'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { useTransition } from 'react';

// The bottle green color for the brand
const BOTTLE_GREEN = "#084C3A";

export default function DisplayPage() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeState, setFadeState] = useState('in');

  // Fetch active advertisements from Supabase
  useEffect(() => {
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('active', true)
          .order('id');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setAds(data);
        } else {
          setAds([{
            id: 'placeholder',
            title: 'No active advertisements',
            description: 'Please add advertisements through the admin panel',
            media_url: null,
            media_type: 'image',
            website_url: null,
            show_qr_code: false
          }]);
        }
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError('Failed to load advertisements');
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, []);

  // Rotate through advertisements every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      // Start fade out
      setFadeState('out');
      
      // Wait for fade out to complete, then change the ad and fade in
      setTimeout(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
        setFadeState('in');
      }, 500); // Half a second for fade out
    }, 5000); // 5 seconds between ad changes

    return () => clearInterval(interval);
  }, [ads]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Publi-Taxi</h1>
            <div className="text-sm">Digital Advertising System</div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex-grow flex items-center justify-center bg-black text-white">
          <p className="text-2xl">Loading advertisements...</p>
        </div>
        
        {/* Footer */}
        <footer style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white text-sm">
          <div className="text-center">© {new Date().getFullYear()} Publi-Taxi - All Rights Reserved</div>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Publi-Taxi</h1>
            <div className="text-sm">Digital Advertising System</div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col items-center justify-center bg-black text-white">
          <h2 className="text-2xl text-red-500 mb-4">Error</h2>
          <p>{error}</p>
        </div>
        
        {/* Footer */}
        <footer style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white text-sm">
          <div className="text-center">© {new Date().getFullYear()} Publi-Taxi - All Rights Reserved</div>
        </footer>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Header */}
      <header style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Publi-Taxi</h1>
          <div className="text-sm">Digital Advertising System</div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-grow relative">
        {currentAd && (
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-500 ${
            fadeState === 'in' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-6xl text-white mb-4 text-center z-10">
            {currentAd.title}
          </h1>
          
          <div className="relative w-full h-screen flex items-center justify-center">
            {currentAd.media_url ? (
              currentAd.media_type === 'video' ? (
                <video 
                  className="w-full h-screen object-cover" 
                  src={currentAd.media_url} 
                  autoPlay 
                  muted 
                  loop
                />
              ) : (
                <>
                  <img 
                    className="w-full h-screen object-cover" 
                    src={currentAd.media_url} 
                    alt={currentAd.title} 
                  />
                  {/* QR Code overlay */}
                  {currentAd.website_url && currentAd.show_qr_code && (
                    <div className="absolute bottom-14 right-2 bg-white p-2 rounded shadow-lg z-20">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentAd.website_url)}`}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="w-full max-w-3xl h-64 bg-gray-800 flex items-center justify-center rounded-lg">
                <p className="text-xl text-gray-400">No media available</p>
              </div>
            )}
          </div>
          
          <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-4xl text-center z-10 bg-black/50 p-4 rounded">
            {currentAd.description}
          </p>
        </div>
      )}

      {/* Ad Counter Indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {ads.map((_, index) => (
            <div 
              key={index} 
              className={`h-3 w-3 rounded-full ${
                index === currentAdIndex ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
      </div>
      
      {/* Footer */}
      <footer style={{ backgroundColor: BOTTLE_GREEN }} className="py-2 px-4 w-full text-white text-sm relative z-30">
        <div className="text-center">© {new Date().getFullYear()} Publi-Taxi - All Rights Reserved</div>
      </footer>
    </div>
  );
}

