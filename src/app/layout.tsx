import { Anton, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import Nav from "./components/nav";

import "./globals.css";
import Footer from "./components/footer";
import Script from "next/script";
import { client } from "@/sanity/client";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const postCount = await client.fetch<number>(
    `count(*[_type == "post"])`,
    {},
    { next: { revalidate: 30 } }
  );
  const hasBlog = postCount > 0;

  return (
    <html lang="en">
      <Script id="disable-right-click" strategy="afterInteractive">
        {`
            document.addEventListener("contextmenu", function(e) {
              if (e.target.tagName === "IMG") {
                e.preventDefault();
              }
            });
          `}
      </Script>

      <Analytics />
      <body className={` ${anton.variable} ${inter.variable} antialiased`}>
        <Nav hasBlog={hasBlog} />
        {children}
        <Footer hasBlog={hasBlog} />
      </body>
    </html>
  );
}
