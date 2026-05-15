import type { Metadata } from "next";
import { Inter, Padauk, Playfair_Display } from "next/font/google"; // Added Playfair_Display
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const padauk = Padauk({
  variable: "--font-padauk",
  subsets: ["myanmar", "latin"],
  weight: ["400", "700"],
});

// Added Playfair Display configuration
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600"], // Set to SemiBold 600
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "JAH_AI_STUDIO | Tactile Maximalism",
  description: "The Zero-Repetition Human-Crafted Creative Studio. High-end 3D UI, motion, and Burmese kinetic typography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* Added playfair.variable to the className list below */
      className={`${inter.variable} ${padauk.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
