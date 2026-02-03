
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Libre_Baskerville, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import VersionOverlay from "@/components/VersionOverlay";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
    title: "CV Crush",
    description: "Boostez votre carrière avec l'IA - Analysez les offres d'emploi et générez des CVs personnalisés",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "CV Crush",
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
    themeColor: DESIGN_TOKENS.colors.neon.purple,
    width: "device-width",
    initialScale: 1,
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
                    "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
                    inter.variable,
                    jetbrainsMono.variable,
                    libreBaskerville.variable,
                    outfit.variable
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <VersionOverlay />
                    {children}
                    <Toaster position="top-center" richColors />
                </ThemeProvider>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
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
