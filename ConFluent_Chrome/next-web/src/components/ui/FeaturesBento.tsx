'use client';

import { motion } from 'framer-motion';
import { Globe2, Shield, Zap, MonitorSmartphone } from 'lucide-react';
import { ReactNode } from 'react';

interface BentoCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    className?: string;
    delay?: number;
}

function BentoCard({ title, description, icon, className = '', delay = 0 }: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
            className={`glass rounded-3xl p-8 relative overflow-hidden group cursor-pointer ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <h3 className="text-2xl font-medium mb-3">{title}</h3>
                <p className="text-secondary leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

export function FeaturesBento() {
    return (
        <section className="py-32 px-4 max-w-7xl mx-auto relative z-10 relative">
            <div className="text-center mb-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-medium mb-6"
                >
                    Flawless translation.
                    <br className="md:hidden" />
                    Zero friction.
                </motion.h2>
                <p className="text-secondary text-lg max-w-2xl mx-auto">
                    Built for professionals who communicate globally. Everything happens securely and instantly within your browser.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[320px] gap-6">
                <BentoCard
                    title="Translates as you type"
                    description="Forget copy-pasting. Dictate or type in your native language, and Confluents magically replaces it with perfect translations before you hit send."
                    icon={<Zap className="w-6 h-6" />}
                    className="md:col-span-2"
                    delay={0.1}
                />
                <BentoCard
                    title="Privacy First"
                    description="Your conversations are yours. No data tracking, no analytics, no persistent storage. Local-first architecture."
                    icon={<Shield className="w-6 h-6" />}
                    delay={0.2}
                />
                <BentoCard
                    title="Works Everywhere"
                    description="Discord, Gmail, X, LinkedIn. If it's a text input, Confluents works seamlessly."
                    icon={<Globe2 className="w-6 h-6" />}
                    delay={0.3}
                />
                <BentoCard
                    title="Mac & Windows"
                    description="Native-feeling shortcuts across all operating systems. Just press Space twice to translate."
                    icon={<MonitorSmartphone className="w-6 h-6" />}
                    className="md:col-span-2"
                    delay={0.4}
                />
            </div>
        </section>
    );
}
