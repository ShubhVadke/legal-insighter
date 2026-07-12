import type { Metadata } from "next";
// 1. Import Space Grotesk and Space Mono from Google Fonts
import { Space_Grotesk, Space_Mono } from "next/font/google"; 
import "./globals.css";

// 2. Configure the fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk", // Variable for Tailwind use
});

const spaceMono = Space_Mono({
  weight: ["400", "700"], // Space Mono requires explicit weights
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "AI Legal Assistant",
  description: "Simplify complex contracts instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the Space Grotesk className to the body */}
      <body className={`${spaceGrotesk.className} ${spaceMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}