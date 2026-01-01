"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Briefcase, Settings, User, LogOut } from "lucide-react";
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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="font-bold text-xl text-blue-600">
                            CVMatch
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={pathname === item.href ? "secondary" : "ghost"}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 hidden sm:inline">
                            {userName}
                        </span>
                        <Button variant="ghost" size="sm" onClick={logout}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
                <div className="flex justify-around py-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex flex-col items-center gap-1 px-4 py-2 ${pathname === item.href ? "text-blue-600" : "text-slate-500"
                                }`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="pb-20 md:pb-0">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
