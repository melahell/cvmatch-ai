"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Briefcase, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/analyze", icon: FileText, label: "Analyser" },
    { href: "/dashboard/tracking", icon: Briefcase, label: "Candidatures" },
    { href: "/dashboard/profile", icon: User, label: "Mon Profil" },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { userName, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    // Get initials for avatar
    const initials = userName
        ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CV</span>
                            </div>
                            <span className="font-bold text-xl text-slate-900 hidden sm:inline">
                                CVMatch
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="sm"
                                            className={`gap-2 ${isActive ? "bg-blue-50 text-blue-700" : ""}`}
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
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{initials}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:inline max-w-[120px] truncate">
                                {userName}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown */}
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900">{userName}</p>
                                        <p className="text-xs text-slate-500">Compte gratuit</p>
                                    </div>
                                    <Link href="/dashboard/profile">
                                        <button
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            Mon Profil
                                        </button>
                                    </Link>
                                    <Link href="/dashboard/profile/rag">
                                        <button
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Gérer mon profil RAG
                                        </button>
                                    </Link>
                                    <div className="border-t border-slate-100 mt-2 pt-2">
                                        <button
                                            onClick={() => { setMenuOpen(false); logout(); }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
                <div className="flex justify-around py-2 safe-area-inset-bottom">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="pb-24 md:pb-8">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
