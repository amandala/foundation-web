"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "../sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText, PortableTextBlock } from "@portabletext/react";

const builder = imageUrlBuilder(client);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

function urlForFile(source: { asset?: { _ref?: string; url?: string } }) {
  if (source?.asset?.url) return source.asset.url;
  if (!source?.asset?._ref) return "";
  const ref = source.asset._ref;
  const [, id, ext] = ref.split("-");
  return `https://cdn.sanity.io/files/4qydhzw9/production/${id}.${ext}`;
}

type Event = {
  name: string;
  slug: { current: string };
  coverImage: { asset: { _ref: string } };
  startDate: string;
  endDate: string;
  description: PortableTextBlock[];
};

type HomePage = {
  heroMedia: {
    type: "image" | "video";
    image?: { asset: { _ref: string } };
    video?: { asset: { url: string } };
  };
  introText: PortableTextBlock[];
  featuredEvent?: Event;
  contactEmail?: string;
  socialLinks?: {
    type: string;
    url: string;
    icon?: PortableTextBlock | string | null;
  }[];
  featuredPosts?: {
    _id: string;
    title: string;
    slug: { current: string };
    description: string;
    publishedAt: string;
    imageUrl?: string;
  }[];
};

const query = `*[_type == "homePage"][0]{
  heroMedia,
  introText,
  contactEmail,
  socialLinks,
  featuredEvent->{
    name,
    "slug": slug.current,
    coverImage,
    startDate,
    endDate,
    description
  },
  featuredPosts[]->{
    _id,
    title,
    slug,
    description,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    }
}`;

export default function HomePage() {
  const [data, setData] = useState<HomePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(query).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!data) return <p className="text-center text-red-500">No data found</p>;

  const { heroMedia, introText, featuredEvent, contactEmail, socialLinks } =
    data;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      {heroMedia?.type === "image" && heroMedia.image && (
        <section className="relative">
          <Image
            src={urlFor(heroMedia.image).width(1200).url()}
            alt="Hero"
            width={1200}
            height={400}
            className="w-full h-auto object-cover"
            placeholder="blur"
            blurDataURL={urlFor(heroMedia.image).width(1200).blur(20).url()}
            loading="eager"
            quality={80}
            onError={(e) => {
              console.error("Error loading hero image:", e);
              e.currentTarget.src = "/fallback-image.jpg"; // Fallback image
            }}
          />
        </section>
      )}
      {heroMedia?.type === "video" && heroMedia.video && (
        <section className="relative">
          <video className="w-full h-auto" loop muted autoPlay playsInline>
            <source src={urlForFile(heroMedia.video)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>
      )}

      {/* Intro Section */}
      <section className="mx-auto max-w-3xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Foundation Collective
        </h1>
        <div className="prose mx-auto">
          <PortableText value={introText} />
        </div>
      </section>

      {/* Featured Event Section */}
      {featuredEvent && (
        <section className="mx-auto max-w-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Featured Event</h2>
          <a
            href={`/events/${featuredEvent.slug}`}
            className="block bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow"
          >
            {featuredEvent.coverImage && (
              <Image
                src={urlFor(featuredEvent.coverImage).width(800).url()}
                alt={featuredEvent.name}
                width={800}
                height={400}
                className="w-full h-[400px] object-cover"
                placeholder="blur"
                blurDataURL={urlFor(featuredEvent.coverImage)
                  .width(800)
                  .blur(20)
                  .url()}
                loading="lazy"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold">{featuredEvent.name}</h3>
              <p className="text-gray-600">
                Start: {new Date(featuredEvent.startDate).toLocaleString()}{" "}
                <br />
                End: {new Date(featuredEvent.endDate).toLocaleString()}
              </p>
              <div className="prose">
                <PortableText value={featuredEvent.description} />
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Featured Blog Posts Section */}
      {data.featuredPosts && data.featuredPosts.length > 0 && (
        <section className="mx-auto max-w-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Featured Blog Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.featuredPosts.map((post) => (
              <a
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="block bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow"
              >
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={800}
                    height={300}
                    className="w-full h-[300px] object-cover"
                    placeholder="blur"
                    blurDataURL={post.imageUrl}
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-600">
                    Published: {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">{post.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      {contactEmail && (
        <section className="mx-auto max-w-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Contact</h2>
          <p className="text-gray-700">
            Reach out to us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-blue-500 hover:underline"
            >
              {contactEmail}
            </a>
          </p>
        </section>
      )}

      {/* Social Links Section */}
      {socialLinks && socialLinks.length > 0 && (
        <footer className="mx-auto max-w-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Follow</h2>
          <ul className="flex gap-4">
            {socialLinks.map(({ type, url }, i) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </main>
  );
}
