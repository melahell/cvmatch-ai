"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-auto hidden md:block">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo & Copyright */}
                    <div className="flex items-center gap-2">
                        <Logo size="xs" showText={false} href="/" asStatic />
                        <span className="text-sm text-slate-500">
                            CV Crush © {currentYear}
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
