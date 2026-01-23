import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ShimmerButton from './ShimmerButton';

// Default background if none provided
import heroBg from '../assets/hero-farmer.jpg';

export default function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="AgroNond Farm"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-20">
                <div className="max-w-3xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                            Empowering <span className="text-emerald-400">Farmers</span>, <br />
                            Connecting <span className="text-yellow-400">Markets</span>.
                        </h1>
                        <p className="mt-6 text-xl text-gray-200 leading-relaxed max-w-2xl">
                            AgroNond simplifies agricultural trading with digital record-keeping, real-time market data, and transparent transactions for farmers and traders.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link to="/login">
                            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                Get Started
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </Link>

                        <Link to="/services">
                            <ShimmerButton className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-lg transition-all">
                                Explore Services
                            </ShimmerButton>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex gap-8 pt-8 border-t border-white/10"
                    >
                        <div>
                            <p className="text-3xl font-bold text-white">10k+</p>
                            <p className="text-emerald-400 text-sm font-medium">Farmers</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">₹50Cr+</p>
                            <p className="text-emerald-400 text-sm font-medium">Traded Value</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-emerald-400 text-sm font-medium">Support</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent z-10" />
        </div>
    );
}
