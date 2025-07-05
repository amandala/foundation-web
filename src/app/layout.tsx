// Removed the import of Metadata as it is not exported from "next"
import { Anton, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import Nav from "./components/nav";

import "./globals.css";
import Footer from "./components/footer";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "sans-serif"],
});

export const metadata = {
  title: "Foundation Collective",
  description: "Foundation Collective",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className={` ${anton.variable} ${inter} antialiased`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
