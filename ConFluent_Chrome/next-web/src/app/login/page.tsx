'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const CLIENT_ID = '911767401457-0hcmk7u2avqcadsi5n2rvkppu4hol79i.apps.googleusercontent.com';
const SUPABASE_URL = 'https://iisjgbmhlgpnzqoaevml.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IHrNdjkpayFqGnp_5jGw6g_MLenBeW9';

export default function LoginPage() {
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If already logged in, sync to extension then redirect
        const existingUser = localStorage.getItem('confluent_user');
        if (existingUser) {
            try {
                const parsed = JSON.parse(existingUser);
                if (parsed) {
                    syncToExtensionAndRedirect(parsed);
                }
            } catch (e) {
                // Invalid data, ignore
            }
        }
    }, [router]);

    const syncToExtensionAndRedirect = (user: any) => {
        let sender: NodeJS.Timeout;

        // Listen for confirmation from content script
        const messageListener = (e: MessageEvent) => {
            if (e.data?.type === 'CONFLUENT_AUTH_OK') {
                clearInterval(sender);
                window.removeEventListener('message', messageListener);
                router.push('/dashboard');
            }
        };
        window.addEventListener('message', messageListener);

        // Retry sending postMessage
        let attempts = 0;
        sender = setInterval(() => {
            window.postMessage({
                type: 'CONFLUENT_AUTH',
                user: user,
                settings: user.settings || null
            }, window.location.origin);

            attempts++;
            if (attempts >= 10) {
                clearInterval(sender);
                window.removeEventListener('message', messageListener);
                router.push('/dashboard');
            }
        }, 200);
    };

    const syncWithSupabase = async (user: any) => {
        try {
            // 1. Try to fetch existing profile
            const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${user.email}`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const data = await response.json();

            if (data.length > 0) {
                // Profile exists, return settings
                return data[0].settings;
            } else {
                // 2. New user, create default profile
                const defaultSettings = {
                    enabled: true,
                    targetLang: 'en',
                    triggerMode: 'timer',
                    delay: 1000,
                    conversationMode: false,
                    myLang: 'fr',
                    theme: 'dark'
                };

                await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        email: user.email,
                        settings: defaultSettings
                    })
                });

                return defaultSettings;
            }
        } catch (err) {
            console.error('Supabase Sync Error:', err);
            return null;
        }
    };

    const handleGoogleLogin = () => {
        if (typeof window === 'undefined' || !(window as any).google) return;
        setIsLoading(true);

        const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'email profile',
            callback: async (response: any) => {
                if (response.error) {
                    console.error('Google Auth Error:', response.error);
                    setIsLoading(false);
                    return;
                }

                try {
                    // Fetch user profile from Google
                    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${response.access_token}` }
                    });
                    const profile = await res.json();

                    const user = {
                        name: profile.name,
                        email: profile.email,
                        picture: profile.picture
                    };

                    // SYNC WITH SUPABASE
                    const settings = await syncWithSupabase(user);
                    (user as any).settings = settings;

                    // Persist in localStorage
                    localStorage.setItem('confluent_user', JSON.stringify(user));
                    setUserData(user);
                    setIsSuccess(true);
                    setIsLoading(false);

                    // Force sync to extension
                    window.postMessage({
                        type: 'CONFLUENT_AUTH',
                        user: user,
                        settings: settings
                    }, window.location.origin);

                    // Redirect after short delay to show success state
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1500);
                } catch (error) {
                    console.error('Login processing error', error);
                    setIsLoading(false);
                }
            }
        });

        client.requestAccessToken();
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center px-4 relative">
            <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

            {/* Background Animated Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4f6ef7]/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[100px] -z-10 animate-pulse animation-delay-2000" />

            <div className="max-w-[420px] w-full text-center z-10">

                {/* Brand Header */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 rounded-full bg-[radial-gradient(circle_at_35%_35%,#4f6ef7,#2a1f6e)] shadow-[0_0_40px_rgba(79,110,247,0.3),inset_-3px_-3px_8px_rgba(0,0,0,0.4),inset_3px_3px_8px_rgba(255,255,255,0.1)] mx-auto mb-6 animate-float" />
                    <h1 className="text-3xl font-medium mb-2">Confluents</h1>
                    <p className="text-secondary text-sm">Sign in to sync your translating preferences across devices.</p>
                </div>

                {/* Login Card */}
                <div className="glass border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                    {!isSuccess ? (
                        <>
                            <h2 className="text-xl font-medium mb-2">Welcome</h2>
                            <p className="text-secondary text-sm mb-8">Sign in with your Google account to get started.</p>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black hover:bg-zinc-100 rounded-2xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 18 18">
                                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4" />
                                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853" />
                                            <path d="M3.964 10.711a5.41 5.41 0 0 1 0-3.422V4.957H.957a8.991 8.991 0 0 0 0 8.086l3.007-2.332z" fill="#fbbc05" />
                                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.957L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#ea4335" />
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-4 my-8 text-xs text-secondary justify-center uppercase tracking-widest">
                                <div className="h-px w-12 bg-white/10" />
                                Secure & Private
                                <div className="h-px w-12 bg-white/10" />
                            </div>

                            <div className="flex flex-col gap-3 text-sm text-secondary text-left">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>We never store your password</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>Only your name and email are saved</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>You can sign out anytime from the extension</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-6 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-medium mb-2">You're in!</h2>
                            <p className="text-secondary text-sm mb-6">Your Confluents extension is now connected.</p>

                            {userData && (
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-[#4f6ef7]/20 rounded-2xl mb-6">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={userData.picture} alt="Profile" className="w-12 h-12 rounded-full border-2 border-[#4f6ef7]" referrerPolicy="no-referrer" />
                                    <div className="text-left">
                                        <div className="font-medium text-sm">{userData.name}</div>
                                        <div className="text-xs text-secondary">{userData.email}</div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-secondary">Redirecting to your dashboard...</p>
                        </div>
                    )}

                </div>

                <p className="mt-8 text-xs text-secondary">
                    By signing in, you agree to our <a href="/privacy" className="text-[#4f6ef7] hover:underline">Privacy Policy</a>.
                </p>

            </div>
        </main>
    );
}
