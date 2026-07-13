// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "AI Legal Assistant",
//   description: "Simplify complex contracts instantly.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className="antialiased">
//         {children}
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
// 1. Nunito_Sans ko Google Fonts se import karo
import { Nunito_Sans } from "next/font/google"; 
import "./globals.css";

// 2. Font ko configure karo aur ek variable asign karo
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito-sans", // Tailwind v4 ke liye variable
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
      {/* 3. className aur variable dono ko body par apply kar do */}
      <body className={`${nunitoSans.className} ${nunitoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
