import { useState, useEffect } from 'react';

/**
 * Creative Agriculture-themed loading animation
 * Features: Animated tractor moving across field with growing crops
 */
export default function Loading({ text = 'Loading' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-100 to-green-50 z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Sun */}
      <div className="absolute top-12 right-16 sm:top-16 sm:right-24">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-yellow-300/50 animate-pulse" />
        {/* Sun rays */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400 to-transparent rounded-full"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-32px)`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>

      {/* Clouds */}
      <div className="absolute top-16 left-8 sm:top-20 sm:left-16 opacity-80">
        <div className="flex">
          <div className="w-12 h-6 bg-white rounded-full" />
          <div className="w-8 h-6 bg-white rounded-full -ml-4" />
          <div className="w-10 h-6 bg-white rounded-full -ml-3" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tractor Animation Container */}
        <div className="relative w-64 sm:w-80 h-32 mb-8">
          {/* Ground/Field */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full" />
          
          {/* Grass patches */}
          <div className="absolute bottom-2 left-4 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-4 bg-green-500 rounded-t-full origin-bottom"
                style={{
                  animation: 'sway 1s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  height: `${12 + Math.random() * 8}px`
                }}
              />
            ))}
          </div>
          
          <div className="absolute bottom-2 right-4 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-4 bg-green-500 rounded-t-full origin-bottom"
                style={{
                  animation: 'sway 1s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  height: `${12 + Math.random() * 8}px`
                }}
              />
            ))}
          </div>

          {/* Tractor - Animating */}
          <div 
            className="absolute bottom-2"
            style={{
              animation: 'tractorMove 3s ease-in-out infinite'
            }}
          >
            {/* Tractor Body */}
            <div className="relative">
              {/* Cabin */}
              <div className="absolute -top-10 left-6 w-8 h-8 bg-green-600 rounded-t-lg border-2 border-green-700">
                <div className="absolute top-1 left-1 w-5 h-4 bg-sky-300 rounded-sm" />
              </div>
              {/* Hood */}
              <div className="w-14 h-6 bg-green-600 rounded-lg border-2 border-green-700" />
              {/* Exhaust */}
              <div className="absolute -top-6 left-1 w-2 h-6 bg-gray-600 rounded-t-full">
                {/* Smoke */}
                <div className="absolute -top-2 left-0 w-2 h-2 bg-gray-400 rounded-full animate-ping opacity-50" />
              </div>
              {/* Front wheel */}
              <div className="absolute -bottom-3 left-0 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center" style={{ animation: 'spin 1s linear infinite' }}>
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              </div>
              {/* Back wheel */}
              <div className="absolute -bottom-4 right-0 w-10 h-10 bg-gray-800 rounded-full border-3 border-gray-600 flex items-center justify-center" style={{ animation: 'spin 1s linear infinite' }}>
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Growing plants animation */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div 
                  className="text-2xl origin-bottom"
                  style={{
                    animation: 'growPlant 2s ease-out infinite',
                    animationDelay: `${i * 0.3}s`
                  }}
                >
                  🌱
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">AgroNond</h1>
            <p className="text-xs text-green-600">Digital Mandi Platform</p>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-green-700 font-medium text-sm sm:text-base">
          {text}<span className="inline-block w-6">{dots}</span>
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-green-500"
              style={{
                animation: 'bounce 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes tractorMove {
          0%, 100% { left: 10%; }
          50% { left: 60%; }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        @keyframes growPlant {
          0% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Page loading spinner
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl">🌾</span>
          </div>
        </div>
        <p className="text-green-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}
