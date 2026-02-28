'use client';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen w-full relative pt-32 pb-24 px-4 overflow-hidden">
            {/* Background Animated Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4f6ef7]/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-3xl mx-auto w-full glass border-white/10 rounded-3xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                <h1 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight">Privacy Policy</h1>
                <p className="text-secondary text-sm mb-12">Last Updated: February 14, 2026</p>

                <div className="space-y-12 text-secondary/90 leading-relaxed">
                    <section>
                        <p className="text-lg text-white mb-6">
                            ConFluent ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome Extension handles your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-white/10">1. Data Collection</h2>
                        <p className="mb-4">
                            ConFluent is designed with privacy as a priority. <strong className="text-white bg-[#4f6ef7]/20 px-2 py-0.5 rounded-md">We do not collect, store, or share your personal data.</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li><strong className="text-white">Account Info:</strong> We store minimal user details (email and name) securely in Supabase solely for managing your pro subscription and preferences.</li>
                            <li><strong className="text-white">No Tracking:</strong> We do not track your browsing history or personal usage patterns.</li>
                            <li><strong className="text-white">No Message Storage:</strong> We do not have a database storing your messages, personal conversations, or translations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-white/10">2. Data Usage</h2>
                        <p className="mb-4">
                            The extension only processes data to perform its core function: translation.
                        </p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li><strong className="text-white">Text Translation:</strong> When you type text or view messages, the extension sends this specific text snippet to a translation API solely for the purpose of returning the translated text.</li>
                            <li><strong className="text-white">Ephemeral Processing:</strong> This data is transient and is not stored by ConFluent after the translation is complete.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-white/10">3. Permissions</h2>
                        <p className="mb-4">
                            We request the minimum permissions necessary for the extension to function:
                        </p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li><strong className="text-white">"Read and change all your data on the websites you visit" (Host Permissions):</strong> This might sound intense, but it is strictly required to detect the text you type into input fields on websites (like Discord, WhatsApp, etc.) so we can replace it with the translation. We do not read anything else.</li>
                            <li><strong className="text-white">Storage:</strong> Used only to save your local settings and auth tokens on your own device.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-white/10">4. Third-Party Services</h2>
                        <p>
                            ConFluent utilizes third-party translation APIs and services (like Supabase and Stripe) to provide translations and manage subscriptions. These services may process the text or data you submit according to their own privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-white/10">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@confluents.xyz" className="text-[#4f6ef7] hover:underline">support@confluents.xyz</a>
                        </p>
                    </section>
                </div>

            </div>

        </main>
    );
}
