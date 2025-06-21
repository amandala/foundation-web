import { PortableTextBlock } from "@portabletext/react";

export type Event = {
  _id: string;
  name: string;
  slug: { current: string };
  coverImage: { asset: { _ref: string } };
  startDate: string;
  endDate: string;
  description: PortableTextBlock[];
};

export type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  publishedAt: string;
  imageUrl?: string;
};

export type GalleryImage = {
  _id: string;
  image: { asset: { _ref: string } };
  caption?: string;
  photoCredit?: string;
  tags?: string[];
};

export type Partner = {
  _id: string;
  name: string;
  logo: { asset: { _ref: string } };
  link?: string;
};

export type HomePage = {
  heroMedia: {
    type: "image" | "video";
    image?: { asset: { _ref: string } };
    video?: { asset: { _ref: string; url?: string } };
  };
  introText: PortableTextBlock[];
  featuredEvent?: Event;
  contactEmail?: string;
  socialLinks?: { type: string; url: string; icon?: React.ReactNode }[];
  featuredPosts?: Post[];
  featuredGalleryImages?: GalleryImage[];
  foundationPartners?: Partner[];
};

export type SocialLink = {
  type: string;
  url: string;
};
