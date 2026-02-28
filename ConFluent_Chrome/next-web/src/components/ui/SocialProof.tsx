'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Software Engineer",
        content: "ConFluent changed how I communicate with our offshore team. No more switching tabs for translation.",
        avatar: null
    },
    {
        name: "Marc Auban",
        role: "Product Designer",
        content: "The real-time translation is pure magic. It feels like I'm fluent in 10 languages instantly.",
        avatar: null
    },
    {
        name: "Elena Rodriguez",
        role: "Content Manager",
        content: "Clean, fast, and private. Exactly what I needed for global customer support on Discord.",
        avatar: null
    }
];

const stats = [
    { label: "Active Users", value: "50k+" },
    { label: "Languages", value: "100+" },
    { label: "Daily Translations", value: "1M+" },
    { label: "Avg. Speed", value: "45ms" }
];

export function SocialProof() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-6xl font-heading font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-accent text-[10px] uppercase tracking-[0.2em] font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Trusted by the global web.</h2>
                    <div className="flex justify-center gap-1 text-accent/80">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass p-10 rounded-[2rem] relative border-white/[0.05]"
                        >
                            <Quote className="absolute top-8 right-10 w-8 h-8 text-white/[0.03]" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-white/40">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <div className="font-semibold text-white/90">{t.name}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted/50">{t.role}</div>
                                </div>
                            </div>
                            <p className="text-muted/70 italic leading-relaxed text-sm">"{t.content}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
