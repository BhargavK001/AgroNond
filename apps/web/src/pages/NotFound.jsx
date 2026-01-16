import { Link } from 'react-router-dom';
import bgImage from '../assets/404-bg.png';

export default function NotFound() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      
      {/* Content Card */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl text-center">
        <h1 className="text-8xl font-bold text-white mb-2 drop-shadow-lg">404</h1>
        <h2 className="text-2xl font-semibold text-green-50 mb-4 drop-shadow-md">Page Not Found</h2>
        
        <p className="text-gray-200 mb-8 leading-relaxed">
          Looks like you've strayed too far from the farm! The crop you're looking for hasn't been planted here.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
