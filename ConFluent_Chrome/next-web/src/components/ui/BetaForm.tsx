'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export function BetaForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulate API call for now. In production, this goes to an endpoint or server action.
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <section className="py-32 px-4 w-full flex flex-col items-center justify-center relative z-10 border-t border-white/5 bg-[#030303]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center max-w-2xl w-full"
            >
                <h2 className="text-4xl md:text-6xl font-medium mb-6 tracking-tight">
                    Ready to write <span className="text-gradient">freely?</span>
                </h2>
                <p className="text-secondary text-lg md:text-xl mb-12">
                    Join the waitlist to get early access to Confluents. We're currently in closed beta.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
                    <div className="relative flex items-center">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50"
                            required
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {status === 'loading' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : status === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {status === 'success' && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-emerald-400 mt-4 text-sm font-medium"
                        >
                            You're on the list. Keep an eye on your inbox.
                        </motion.p>
                    )}
                </form>
            </motion.div>
        </section>
    );
}
