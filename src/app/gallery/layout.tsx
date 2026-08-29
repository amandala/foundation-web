import type { Metadata } from "next";
import { createShareMetadata } from "../share-metadata";

export const metadata: Metadata = createShareMetadata({
  title: "Gallery",
  description: "Explore the Foundation Collective gallery of urban art and graffiti.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
