import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import Footer from "./ui/Footer";
import Navbar from "./ui/Navbar";
import GoogleAnalytics from "./components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raíz | Noticias",
  description: "Noticias de actualidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <Auth0Provider>
          <div className="flex-1 flex flex-col">
            <Navbar />
            {children}
          </div>
          <Footer />
        </Auth0Provider>
      </body>
    </html>
  );
}
