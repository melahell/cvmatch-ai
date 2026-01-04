"use client";

import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-auto hidden md:block">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo & Copyright */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-xs">CV</span>
                        </div>
                        <span className="text-sm text-slate-500">
                            CVMatch © {currentYear}
                        </span>
                    </div>

                    {/* Legal Links */}
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/legal/cgu"
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Conditions Générales
                        </Link>
                        <Link
                            href="/legal/privacy"
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Confidentialité
                        </Link>
                        <Link
                            href="/legal/contact"
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Nous contacter
                        </Link>
                    </nav>

                    {/* Made with love */}
                    <div className="text-sm text-slate-400">
                        Fait avec 💜 en France
                    </div>
                </div>
            </div>
        </footer>
    );
}
