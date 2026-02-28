export function Footer() {
    return (
        <footer className="w-full py-12 px-4 border-t border-white/10 bg-[#050505] text-secondary">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start font-heading">
                    <span className="text-xl font-bold text-white mb-2">ConFluent</span>
                    <span className="text-sm">Translate Anything, Everywhere.</span>
                </div>

                <div className="flex gap-6 text-sm">
                    <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="mailto:hello@confluents.xyz" className="hover:text-primary transition-colors">Contact</a>
                </div>

                <div className="text-sm">
                    &copy; {new Date().getFullYear()} ConFluent. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
