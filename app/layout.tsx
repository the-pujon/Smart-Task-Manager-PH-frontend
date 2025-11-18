"use client";

import { useEffect } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";
import Providers from "@/lib/Providers/Providers";
import { Toaster } from "@/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
          <Providers>
        <ThemeProvider>  {/* <Provider store={store}> */}
            {children}
            <Analytics />
            <Toaster richColors={true} position="top-center" swipeDirections={["left", "right"]} />
          {/* </Provider> */}
        </ThemeProvider>
          </Providers>
      </body>
    </html>
  );
}
