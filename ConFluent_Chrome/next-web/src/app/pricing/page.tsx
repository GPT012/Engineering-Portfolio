'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const SUPABASE_URL = 'https://iisjgbmhlgpnzqoaevml.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IHrNdjkpayFqGnp_5jGw6g_MLenBeW9';

const PRICES = {
    weekly: 'price_1T2I24RubHpfeJR9xoHo0GVh',
    monthly: 'price_1T2I2NRubHpfeJR9TUAiOU3x'
};

export default function PricingPage() {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const subscribe = async (plan: 'weekly' | 'monthly') => {
        try {
            if (typeof window === 'undefined') return;

            const rawUser = localStorage.getItem('confluent_user');
            if (!rawUser) {
                // Redirect to login if not authenticated
                router.push('/login');
                return;
            }

            const user = JSON.parse(rawUser);
            if (!user || !user.email) {
                router.push('/login');
                return;
            }

            setLoadingPlan(plan);

            // Call Edge Function to create Stripe Checkout Session
            const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                    email: user.email,
                    priceId: PRICES[plan],
                    plan: plan
                })
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (err) {
            console.error('Checkout Error:', err);
            alert('Unable to start checkout. Please try again.');
            setLoadingPlan(null);
        }
    };

    return (
        <main className="min-h-screen w-full relative pt-32 pb-24 px-4 overflow-hidden">
            {/* Background Animated Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4f6ef7]/5 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px] -z-10 animate-pulse animation-delay-2000" />

            {/* Hero */}
            <section className="text-center max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-8">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    2 weeks free trial included
                </div>
                <h1 className="text-4xl md:text-6xl font-medium mb-6 tracking-tight">
                    Translate without <span className="bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6] bg-clip-text text-transparent">limits</span>
                </h1>
                <p className="text-lg text-secondary">
                    Start with 14 days free. Then choose the plan that fits your needs. Cancel anytime.
                </p>
            </section>

            {/* Pricing Cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150">

                {/* Weekly Plan */}
                <div className="glass border-white/10 rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    <h2 className="text-2xl font-medium mb-2">Weekly</h2>
                    <p className="text-secondary text-sm mb-8">Pay as you go, perfect for short-term needs.</p>

                    <div className="flex items-baseline gap-2 mb-10">
                        <span className="text-2xl font-semibold text-secondary">€</span>
                        <span className="text-5xl font-bold">1</span>
                        <span className="text-secondary">/ week</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1 text-sm text-secondary">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Unlimited translations</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Conversation Mode</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> All languages</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Cloud sync</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Cancel anytime</li>
                    </ul>

                    <button
                        onClick={() => subscribe('weekly')}
                        disabled={loadingPlan !== null}
                        className="w-full py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors font-medium flex justify-center items-center disabled:opacity-50"
                    >
                        {loadingPlan === 'weekly' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Choose Weekly'}
                    </button>
                </div>

                {/* Monthly Plan (Popular) */}
                <div className="glass border-[#4f6ef7]/40 bg-gradient-to-b from-[#4f6ef7]/5 to-transparent rounded-3xl p-8 relative transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(79,110,247,0.2)] flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6]" />

                    <div className="inline-block px-3 py-1 bg-[#4f6ef7]/10 border border-[#4f6ef7]/30 text-[#4f6ef7] rounded-full text-xs font-semibold uppercase tracking-wider mb-6 w-fit">
                        Most Popular
                    </div>

                    <h2 className="text-2xl font-medium mb-2">Monthly</h2>
                    <p className="text-secondary text-sm mb-6">Best value — save more every month.</p>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-semibold text-secondary">€</span>
                        <span className="text-5xl font-bold">3.49</span>
                        <span className="text-secondary">/ month</span>
                    </div>

                    <div className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-semibold mb-8 w-fit">
                        Save ~20% vs weekly
                    </div>

                    <ul className="space-y-4 mb-8 flex-1 text-sm text-secondary">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Unlimited translations</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Conversation Mode</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> All languages</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Cloud sync</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Priority support</li>
                    </ul>

                    <button
                        onClick={() => subscribe('monthly')}
                        disabled={loadingPlan !== null}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6] hover:shadow-[0_4px_20px_rgba(79,110,247,0.4)] transition-all font-medium flex justify-center items-center text-white disabled:opacity-50"
                    >
                        {loadingPlan === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Choose Monthly'}
                    </button>
                </div>

            </div>

            {/* Guarantee Section */}
            <section className="max-w-2xl mx-auto glass border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-medium mb-2">Cancel anytime, hassle-free</h3>
                    <p className="text-secondary text-sm leading-relaxed">
                        No contracts, no commitments. Your subscription can be canceled at any time from your account dashboard. Payments are processed securely via Stripe.
                    </p>
                </div>
            </section>

            {/* Loading Overlay */}
            {loadingPlan && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#4f6ef7] mb-4" />
                    <p className="text-secondary font-medium animate-pulse">Redirecting to secure checkout...</p>
                </div>
            )}

        </main>
    );
}
