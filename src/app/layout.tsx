import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import Navbar from "@/components/ui/Navbar";
import CursorGlow from "@/components/ui/CursorGlow";
import LoadingScreen from "@/components/ui/LoadingScreen";
import AudioToggle from "@/components/ui/AudioToggle";
import CinematicOverlays from "@/components/ui/CinematicOverlays";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "itsdaniella | Creative Developer Portfolio",
  description: "A fully immersive cinematic 3D portfolio for itsdaniella - Creative Developer, UI/UX, and Full Stack Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="selection:bg-primary selection:text-primary-dark scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SmoothScrollProvider>
          <AudioToggle />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
