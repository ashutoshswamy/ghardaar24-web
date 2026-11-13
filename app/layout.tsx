import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "intro.js/introjs.css"; // must load before globals.css so our overrides win
import "./globals.css";
import "./site.css";
import "./backoffice.css";
import {
  jsonLd,
  defaultMetadata,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo";
import Script from "next/script";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MotionConfigProvider from "@/components/MotionConfigProvider";
import { AuthProvider } from "@/lib/auth";
import { StaffAuthProvider } from "@/lib/staff-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  variable: "--font-poppins", // legacy variable name, used all through globals.css
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <meta name="theme-color" content="#f36a2a" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pune" />


        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(generateWebsiteSchema()),
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${bricolage.variable} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QEHYN9XRC7"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-QEHYN9XRC7');`}
        </Script>
        <MotionConfigProvider>
          <TooltipProvider>
            <AuthProvider>
              <StaffAuthProvider>
                <ScrollToTop />
                {children}
                <FloatingWhatsApp />
                <Toaster />
              </StaffAuthProvider>
            </AuthProvider>
          </TooltipProvider>
        </MotionConfigProvider>
      </body>
    </html>
  );
}
