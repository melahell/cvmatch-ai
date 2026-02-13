"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface-secondary border-t border-cvBorder-light py-6 mt-auto hidden md:block">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo & Copyright */}
                    <div className="flex items-center gap-2">
                        <Logo size="xs" showText={false} href="/" asStatic />
                        <span className="text-sm text-cvText-secondary">
                            CV Crush © {currentYear}
                        </span>
                    </div>

                    {/* Legal Links */}
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/legal/cgu"
                            className="text-sm text-cvText-secondary hover:text-cvText-primary transition-colors"
                        >
                            Conditions Générales
                        </Link>
                        <Link
                            href="/legal/privacy"
                            className="text-sm text-cvText-secondary hover:text-cvText-primary transition-colors"
                        >
                            Confidentialité
                        </Link>
                        <Link
                            href="/legal/contact"
                            className="text-sm text-cvText-secondary hover:text-cvText-primary transition-colors"
                        >
                            Nous contacter
                        </Link>
                    </nav>

                    {/* Made with love */}
                    <div className="text-sm text-cvText-secondary">
                        Fait avec 💜 en France
                    </div>
                </div>
            </div>
        </footer>
    );
}
