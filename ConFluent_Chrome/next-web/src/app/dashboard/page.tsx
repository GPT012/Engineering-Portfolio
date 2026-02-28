'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Inbox } from 'lucide-react';

const SUPABASE_URL = 'https://iisjgbmhlgpnzqoaevml.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IHrNdjkpayFqGnp_5jGw6g_MLenBeW9';

interface User {
    name: string;
    email: string;
    picture: string;
}

interface Profile {
    created_at: string;
    trial_start: string | null;
    trial_end: string | null;
}

interface Subscription {
    plan: string;
    current_period_end: string;
}

interface Transaction {
    id: string;
    created_at: string;
    plan: string;
    amount: number;
    currency: string;
    status: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeSub, setActiveSub] = useState<Subscription | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check auth
        const rawUser = localStorage.getItem('confluent_user');
        if (!rawUser) {
            setIsLoading(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(rawUser);
            setUser(parsedUser);
            fetchDashboardData(parsedUser.email);
        } catch {
            setIsLoading(false);
        }
    }, []);

    const fetchDashboardData = async (email: string) => {
        try {
            const headers = {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            };

            // Fetch profile
            const [profileRes, subRes, txRes] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${email}&select=*`, { headers }),
                fetch(`${SUPABASE_URL}/rest/v1/subscriptions?email=eq.${email}&status=eq.active&order=created_at.desc&limit=1`, { headers }),
                fetch(`${SUPABASE_URL}/rest/v1/transactions?email=eq.${email}&order=created_at.desc&limit=20`, { headers })
            ]);

            const [profiles, subs, txs] = await Promise.all([
                profileRes.json(),
                subRes.json(),
                txRes.json()
            ]);

            setProfile(profiles[0] || null);
            setActiveSub(subs[0] || null);
            setTransactions(txs || []);
        } catch (err) {
            console.error('Dashboard Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatAmount = (cents: number, currency = 'eur') => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: currency
        }).format(cents / 100);
    };

    if (isLoading) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4f6ef7]/5 rounded-full blur-[120px] -z-10" />

                <div className="text-center max-w-md">
                    <h2 className="text-3xl font-medium mb-4">Sign in to view your account</h2>
                    <p className="text-secondary mb-8">Log in with your Google account to see your subscription and payment history.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-8 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform"
                    >
                        Sign In
                    </button>
                </div>
            </main>
        );
    }

    // Calculate status
    const now = new Date();
    const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;
    const inTrial = trialEnd && trialEnd > now;
    const hasActiveSub = !!activeSub;

    let StatusBadge = null;
    if (hasActiveSub) {
        StatusBadge = (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active — {activeSub.plan}
            </div>
        );
    } else if (inTrial) {
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        StatusBadge = (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4f6ef7]/10 border border-[#4f6ef7]/20 text-[#4f6ef7] rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7]" />
                Free Trial — {daysLeft} days left
            </div>
        );
    } else {
        StatusBadge = (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Expired
            </div>
        );
    }

    return (
        <main className="min-h-screen w-full relative pt-32 pb-24 px-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-4xl mx-auto w-full">
                <h1 className="text-3xl md:text-4xl font-medium mb-10 tracking-tight">My Account</h1>

                {/* Account Card */}
                <div className="glass border-white/10 p-6 md:p-8 rounded-3xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.picture} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-[#4f6ef7]" referrerPolicy="no-referrer" />
                            <div>
                                <div className="text-xl font-medium">{user.name}</div>
                                <div className="text-secondary text-sm">{user.email}</div>
                            </div>
                        </div>
                        <div>{StatusBadge}</div>
                    </div>

                    {/* Subscription Info */}
                    {hasActiveSub ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white/5 rounded-2xl p-6">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-2">Plan</div>
                                <div className="font-medium">{activeSub.plan === 'weekly' ? 'Weekly — €1/wk' : 'Monthly — €3.49/mo'}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-2">Next billing</div>
                                <div className="font-medium">{formatDate(activeSub.current_period_end)}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-2">Member since</div>
                                <div className="font-medium">{profile ? formatDate(profile.created_at) : '—'}</div>
                            </div>
                        </div>
                    ) : inTrial ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white/5 rounded-2xl p-6">
                                    <div className="text-xs text-secondary uppercase tracking-wider mb-2">Trial started</div>
                                    <div className="font-medium">{profile ? formatDate(profile.trial_start!) : '—'}</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6">
                                    <div className="text-xs text-secondary uppercase tracking-wider mb-2">Trial ends</div>
                                    <div className="font-medium">{formatDate(trialEnd?.toISOString() || '')}</div>
                                </div>
                            </div>
                            <button onClick={() => router.push('/pricing')} className="px-6 py-3 bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6] text-white rounded-full font-medium text-sm hover:opacity-90 transition-opacity">
                                Upgrade Now
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-secondary mb-6">Your free trial has ended. Subscribe to continue using Confluents.</p>
                            <button onClick={() => router.push('/pricing')} className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:scale-105 transition-transform">
                                Choose a Plan
                            </button>
                        </div>
                    )}
                </div>

                {/* Transactions */}
                <h2 className="text-xl font-medium mb-6">Payment History</h2>
                <div className="glass border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-xs text-secondary uppercase tracking-wider border-b border-white/5">
                                        <th className="p-4 md:p-6 font-medium">Date</th>
                                        <th className="p-4 md:p-6 font-medium">Plan</th>
                                        <th className="p-4 md:p-6 font-medium">Amount</th>
                                        <th className="p-4 md:p-6 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <td className="p-4 md:p-6 text-secondary">{formatDate(tx.created_at)}</td>
                                            <td className="p-4 md:p-6 capitalize">{tx.plan}</td>
                                            <td className="p-4 md:p-6">{formatAmount(tx.amount, tx.currency)}</td>
                                            <td className="p-4 md:p-6">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${tx.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-secondary">
                            <Inbox className="w-12 h-12 mb-4 opacity-20" />
                            <p>No transactions yet.</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
