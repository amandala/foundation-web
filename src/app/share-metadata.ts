import type { Metadata } from "next";

export const SITE_URL = "https://foundationcollective.ca";
export const SITE_NAME = "Foundation Collective";
export const SITE_DESCRIPTION =
  "We believe graffiti belongs in public space. We work to break down the stigmas around urban art, connect generations of creatives, and leave behind work that makes Calgary more vibrant, more human, and more alive.";

type ShareMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  type?: "website" | "article";
  publishedTime?: string;
};

const defaultImage = {
  url: "/pageshare.jpg",
  width: 1200,
  height: 630,
  alt: "An artist painting a colourful mural",
};

export function createShareMetadata({
  title,
  description,
  path,
  image = defaultImage,
  type = "website",
  publishedTime,
}: ShareMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_CA",
      type,
      images: [image],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
