import { Anton, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import Nav from "./components/nav";

import "./globals.css";
import Footer from "./components/footer";
import Script from "next/script";
import { client } from "@/sanity/client";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./share-metadata";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/pageshare-branded.jpg",
        width: 1200,
        height: 630,
        alt: "An artist painting a colourful mural",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/pageshare-branded.jpg"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const postCount = await client.fetch<number>(
    `count(*[_type == "post"])`,
    {},
    { next: { revalidate: 30 } },
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
