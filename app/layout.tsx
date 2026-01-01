
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import VersionOverlay from "@/components/VersionOverlay";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "CVMatch AI",
    description: "Boostez votre carrière avec l'IA - Analysez les offres d'emploi et générez des CVs personnalisés",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "CVMatch AI",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/icon-192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#2563eb",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    inter.variable
                )}
            >
                <VersionOverlay />
                {children}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(reg => console.log('SW registered'))
                                        .catch(err => console.log('SW failed:', err));
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
