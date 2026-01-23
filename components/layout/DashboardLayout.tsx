"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { usePathname } from "next/navigation";
import { Home, FileText, Briefcase, User, LogOut, ChevronDown, BarChart3, Download, Keyboard, Bell, LayoutTemplate, GitCompare, BookmarkCheck, Landmark, Shield, Upload, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRAGData } from "@/hooks/useRAGData";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { Footer } from "./Footer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ExportDataModal } from "@/components/modals/ExportDataModal";
import { KeyboardShortcutsModal } from "@/components/modals/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

// Navigation alignée avec la frise workflow (3 étapes)
const baseNavItems = [
    // Étape 1 : Importer vos documents
    { href: "/dashboard/profile", icon: Upload, label: "Documents & Profil" },
    // Étape 2 : Comparer une offre d'emploi
    { href: "/dashboard/tracking", icon: Briefcase, label: "Candidatures" },
    // Étape 3 : Générer le CV parfait (analyser permet de générer)
    { href: "/dashboard/analyze", icon: FileSearch, label: "Analyser & Générer" },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { userId, userName, logout } = useAuth();
    const { data: ragData } = useRAGData(userId); // Récupérer la photo de profil
    const [menuOpen, setMenuOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [planLabel, setPlanLabel] = useState("Gratuit");

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    useEffect(() => {
        const run = async () => {
            try {
                const authHeader = await getSupabaseAuthHeader();
                if (authHeader.Authorization) {
                    await fetch("/api/admin/auto-role", {
                        method: "POST",
                        headers: authHeader,
                    });
                }
                const res = await fetch("/api/admin/me", {
                    headers: authHeader,
                });
                if (!res.ok) return;
                const data = await res.json();
                setIsAdmin(!!data.isAdmin);
                const tier = data.subscriptionTier || "free";
                setPlanLabel(tier === "pro" ? "Pro" : tier === "team" ? "Team" : "Gratuit");
            } catch {
                setIsAdmin(false);
            }
        };
        run();
    }, []);

    // Get initials for avatar
    const initials = userName
        ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    const navItems = isAdmin
        ? [...baseNavItems, { href: "/admin", icon: Shield, label: "Admin" }]
        : baseNavItems;

    return (
        <div className="min-h-screen bg-surface-secondary dark:bg-slate-950 flex flex-col">
            {/* Skip Link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neon-purple focus:text-white focus:rounded-md focus:shadow-lg"
            >
                Aller au contenu principal
            </a>

            {/* Top Navigation Bar */}
            <header role="banner" className="bg-surface-primary dark:bg-slate-900 border-b border-cvBorder-light dark:border-slate-800 sticky top-0 z-50 shadow-level-1">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo - Agrandi pour plus d'impact */}
                        <Logo size="lg" showText className="hidden sm:flex" />
                        <Logo size={64} showText={false} className="sm:hidden" />

                        {/* Desktop Nav */}
                        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                // Active state: exact match or starts with (for sub-pages)
                                const isActive = pathname === item.href || 
                                    (item.href !== "/dashboard" && pathname?.startsWith(item.href)) ||
                                    // Special case: /dashboard is active for profile (home)
                                    (item.href === "/dashboard/profile" && pathname === "/dashboard");
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="sm"
                                            className={`gap-2 transition-all ${isActive ? "bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 text-neon-purple border-l-2 border-neon-purple" : "dark:text-slate-300"}`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                            aria-label="Menu utilisateur"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors"
                        >
                            {/* Photo de profil ou initiales */}
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-neon-pink to-neon-indigo shrink-0">
                                {ragData?.photo_url ? (
                                    <Image
                                        src={ragData.photo_url}
                                        alt={userName || "Photo de profil"}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                        unoptimized // Signed URL from Supabase
                                    />
                                ) : (
                                    <span className="text-white text-xs font-bold">{initials}</span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-cvText-primary dark:text-slate-300 hidden sm:inline max-w-[120px] truncate">
                                {userName}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-cvText-secondary transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown */}
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div role="menu" aria-label="Menu de l'utilisateur" className="absolute right-0 top-full mt-2 w-56 bg-surface-primary dark:bg-slate-900 rounded-lg shadow-lg border border-cvBorder-light dark:border-slate-700 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-cvBorder-light dark:border-slate-700">
                                        <p className="text-sm font-medium text-cvText-primary dark:text-slate-100">{userName}</p>
                                        <p className="text-xs text-cvText-secondary dark:text-slate-600">Compte {planLabel}</p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="py-1">
                                        <ThemeToggle />
                                        <Link href="/demo">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <Landmark className="w-4 h-4" />
                                                Démo Museum
                                            </button>
                                        </Link>
                                        <Link href="/dashboard/saved-jobs">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <BookmarkCheck className="w-4 h-4" />
                                                Offres sauvegardées
                                            </button>
                                        </Link>
                                        <Link href="/dashboard/compare">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <GitCompare className="w-4 h-4" />
                                                Comparer CVs
                                            </button>
                                        </Link>
                                        <Link href="/dashboard/templates">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <LayoutTemplate className="w-4 h-4" />
                                                Templates CV
                                            </button>
                                        </Link>
                                        <Link href="/dashboard/stats">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                                Mes statistiques
                                            </button>
                                        </Link>
                                        <Link href="/dashboard/settings">
                                            <button
                                                onClick={() => setMenuOpen(false)}
                                                className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <Bell className="w-4 h-4" />
                                                Paramètres
                                            </button>
                                        </Link>
                                        {isAdmin && (
                                            <Link href="/admin">
                                                <button
                                                    onClick={() => setMenuOpen(false)}
                                                    className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    Backoffice Admin
                                                </button>
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { setMenuOpen(false); setExportModalOpen(true); }}
                                            className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Exporter mes données
                                        </button>
                                        <button
                                            onClick={() => { setMenuOpen(false); setShortcutsModalOpen(true); }}
                                            className="w-full px-4 py-2 text-left text-sm text-cvText-primary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Keyboard className="w-4 h-4" />
                                            Raccourcis clavier
                                            <span className="ml-auto text-xs text-cvText-secondary">⌘/</span>
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-cvBorder-light dark:border-slate-700 mt-1 pt-1">
                                        <div className="px-4 py-1 text-xs text-cvText-secondary">
                                            CV Crush v5.3.9
                                        </div>
                                        <button
                                            onClick={() => { setMenuOpen(false); logout(); }}
                                            className="w-full px-4 py-2 text-left text-sm text-semantic-error hover:bg-semantic-error/10 dark:hover:bg-red-950 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Nav - Enhanced with safe areas and better touch targets */}
            <nav aria-label="Navigation principale mobile" className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-primary dark:bg-slate-900 border-t border-cvBorder-light dark:border-slate-800 z-50 shadow-lg pb-safe">
                <div className="flex justify-around px-2 pt-2 pb-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} className="flex-1 max-w-[100px]">
                                <div className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all ${isActive
                                    ? "text-neon-purple bg-neon-purple/5 dark:bg-neon-purple/10 scale-105"
                                    : "text-cvText-secondary dark:text-slate-600 hover:text-cvText-primary active:scale-95"
                                    }`}>
                                    <div className={`relative ${isActive ? 'animate-[pulse_2s_ease-in-out]' : ''}`}>
                                        <item.icon className="w-5 h-5" />
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-purple rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content - Safe area padding */}
            <main id="main-content" role="main" aria-label="Contenu principal" className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-8 flex-1">
                {children}
            </main>

            {/* Footer - Desktop only */}
            <Footer />

            {/* Modals */}
            <ExportDataModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
            />
            <KeyboardShortcutsModal
                isOpen={shortcutsModalOpen}
                onClose={() => setShortcutsModalOpen(false)}
            />
        </div>
    );
}

export default DashboardLayout;
