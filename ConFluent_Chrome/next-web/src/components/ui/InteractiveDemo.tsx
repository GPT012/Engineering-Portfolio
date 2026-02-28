'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

const phrases = [
    { source: "Salut, comment ça va ?", target: "Hi, how are you?" },
    { source: "C'est impressionnant !", target: "This is impressive!" },
    { source: "Le projet avance bien.", target: "The project is coming along nicely." }
];

export function InteractiveDemo() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTarget, setShowTarget] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const currentPhrase = phrases[currentIndex].source;

        const typeText = async () => {
            // 1. Typing effect for source text
            for (let i = 0; i <= currentPhrase.length; i++) {
                if (!isMounted) return;
                setDisplayText(currentPhrase.substring(0, i));
                await new Promise(r => setTimeout(r, 50));
            }

            // 2. Wait a moment
            if (!isMounted) return;
            await new Promise(r => setTimeout(r, 600));

            // 3. User presses 'Space' to translate
            if (!isMounted) return;
            setIsTranslating(true);
            await new Promise(r => setTimeout(r, 400));

            // 4. Show translation
            if (!isMounted) return;
            setShowTarget(true);
            setIsTranslating(false);
            setDisplayText(phrases[currentIndex].target);

            // 5. Wait before next phrase
            if (!isMounted) return;
            await new Promise(r => setTimeout(r, 3000));

            // Reset
            if (!isMounted) return;
            setShowTarget(false);
            setDisplayText('');
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
        };

        typeText();

        return () => {
            isMounted = false;
        };
    }, [currentIndex]);

    return (
        <section className="py-24 px-4 max-w-5xl mx-auto w-full relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-medium mb-4">See it in action.</h2>
                <p className="text-secondary">Type in your language. Double space. Sent in theirs.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative"
            >
                {/* Fake Browser Header */}
                <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <div className="mx-auto bg-white/5 rounded-md px-24 py-1 text-xs text-white/40 flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        discord.com/app
                    </div>
                </div>

                {/* Fake Input Area */}
                <div className="p-8 md:p-12 min-h-[200px] flex items-center justify-center bg-[#0a0a0a]">
                    <div className="w-full max-w-2xl bg-[#313338] text-[#dcddde] rounded-lg p-4 font-sans text-lg relative flex items-center">

                        <AnimatePresence mode="popLayout">
                            {showTarget ? (
                                <motion.span
                                    key="target"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-emerald-400"
                                >
                                    {displayText}
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="source"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {displayText}
                                    <span className="animate-pulse inline-block w-2 bg-white/50 h-5 ml-1 align-middle" />
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Simulated Extension UI */}
                        <AnimatePresence>
                            {isTranslating && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute right-4 px-2 py-1 bg-white text-black text-xs font-mono rounded inline-flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                >
                                    Translating...
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </motion.div>
        </section>
    );
}
