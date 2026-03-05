"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        // Check for token in URL first (SSO from main site)
        const params = new URLSearchParams(window.location.search);
        const incomingToken = params.get('token');

        if (incomingToken && incomingToken !== "null" && incomingToken !== "undefined") {
            localStorage.setItem("jan_admin_token", incomingToken);
            // Clean the URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        const token = localStorage.getItem("jan_admin_token");
        const isValidToken = token && token !== "null" && token !== "undefined";

        if (!isValidToken && !isLoginPage) {
            setIsAuthenticated(false);
            router.push("/login");
        } else if (isValidToken) {
            setIsAuthenticated(true);
        } else if (isLoginPage) {
            setIsAuthenticated(false);
        }
    }, [pathname, router, isLoginPage]);

    // Show nothing until auth check is done (to avoid flicker)
    if (isAuthenticated === null) {
        return (
            <html lang="en">
                <body className={`${inter.variable} ${outfit.variable} bg-slate-950`} />
            </html>
        );
    }

    // Redirect to login if not authenticated and not already on the login page
    if (!isAuthenticated && !isLoginPage) {
        return (
            <html lang="en">
                <body className={`${inter.variable} ${outfit.variable} bg-slate-950`} />
            </html>
        );
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="flex min-h-screen bg-transparent overflow-hidden">
                        {!isLoginPage && <Sidebar />}
                        <main className="flex-1 overflow-y-auto h-screen">
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
