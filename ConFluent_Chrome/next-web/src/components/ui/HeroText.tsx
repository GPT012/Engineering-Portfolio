'use client';

import { motion } from 'framer-motion';

export function HeroText() {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full glass text-xs font-mono text-muted uppercase tracking-wider"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                Translate as you type
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.85] text-white"
            >
                Write <span className="text-muted/40 italic">here.</span>
                <br />
                Read <span className="text-gradient">everywhere.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-lg md:text-xl text-muted/60 max-w-2xl mb-12"
            >
                Real-time translation directly in your input fields. ConFluent breaks language
                barriers on any website, instantly and privately.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <button className="px-10 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-all duration-300 cursor-pointer">
                    Join the Beta
                </button>
                <button className="px-10 py-4 rounded-full glass text-white font-medium hover:bg-white/5 transition-colors duration-300 cursor-pointer">
                    See how it works
                </button>
            </motion.div>
        </div>
    );
}
