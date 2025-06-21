"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { client } from "../sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { Partner } from "./types";

interface HomePage {
  heroMedia?: {
    type: "image" | "video";
    image?: { asset: { _ref: string } };
    video?: { asset?: { _ref?: string; url?: string } };
  };
  introText?: PortableTextBlock[];
  contactEmail?: string;
  socialLinks?: { type: string; url: string }[];
  featuredEvent?: {
    name: string;
    slug: string;
    coverImage?: { asset: { _ref: string } };
    startDate: string;
    endDate: string;
    description: PortableTextBlock[];
  };
  featuredPosts?: {
    _id: string;
    title: string;
    slug: { current: string };
    description: string;
    publishedAt: string;
    imageUrl: string;
  }[];
  featuredGalleryImages?: {
    _id: string;
    image: { asset: { _ref: string } };
    caption?: string;
    photoCredit?: string;
    tags?: string[];
  }[];
  foundationPartners?: Partner[];
}

const builder = imageUrlBuilder(client);
const urlFor = (source: { asset: { _ref: string } }) => builder.image(source);

function urlForFile(source: { asset?: { _ref?: string; url?: string } }) {
  if (source?.asset?.url) return source.asset.url;
  if (!source?.asset?._ref) return "";
  const ref = source.asset._ref;
  const [, id, ext] = ref.split("-");
  return `https://cdn.sanity.io/files/4qydhzw9/production/${id}.${ext}`;
}

const query = `*[_type == "homePage"][0]{
  heroMedia,
  introText,
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
  },
  featuredGalleryImages[]->{
    _id,
    image,
    caption,
    photoCredit,
    "tags": tags[]->slug.current
  },
  foundationPartners[]->{
    _id,
    name,
    logo,
    link
  }
}`;

export default function HomePage() {
  const [data, setData] = useState<HomePage | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state for selected featured gallery image URL
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    client.fetch(query).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!data) return <p className="text-center text-red-500">No data found</p>;

  const {
    heroMedia,
    introText,
    featuredEvent,
    featuredPosts,
    featuredGalleryImages,
    foundationPartners,
  } = data;

  return (
    <main className="min-h-screen">
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
          Foundation Collective
        </h1>
        <div className="prose mx-auto">
          <PortableText value={introText || []} />
        </div>
      </section>

      {/* Featured Gallery Images Section */}
      {featuredGalleryImages && featuredGalleryImages.length > 0 && (
        <section className="mx-auto max-w-5xl p-8">
          <h2 className="text-2xl font-bold mb-6">Featured Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredGalleryImages.map((img) => {
              const thumbUrl = urlFor(img.image)
                .width(400)
                .height(250)
                .auto("format")
                .url();

              const fullUrl = urlFor(img.image).auto("format").url();

              return (
                <div
                  key={img._id}
                  className="cursor-pointer rounded-lg overflow-hidden shadow hover:opacity-80 transition-opacity"
                  onClick={() => setModalImageUrl(fullUrl)}
                >
                  <Image
                    src={thumbUrl}
                    alt={img.caption || "Featured image"}
                    width={400}
                    height={250}
                    style={{ objectFit: "cover" }}
                    placeholder="blur"
                    blurDataURL={urlFor(img.image)
                      .width(400)
                      .height(250)
                      .blur(20)
                      .url()}
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-sm text-center mt-2 text-gray-600">
                      {img.caption}
                    </p>
                  )}
                  {img.photoCredit && (
                    <p className="text-xs text-center mt-1 text-gray-400 italic">
                      {img.photoCredit}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

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
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="mx-auto max-w-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">Featured Blog Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
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

      {/* Modal overlay */}
      {modalImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-pointer"
          onClick={() => setModalImageUrl(null)}
        >
          <Image
            src={modalImageUrl}
            alt="Full size image"
            width={800}
            height={600}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      )}

      {/* Foundation Partners Section */}
      {foundationPartners && foundationPartners.length > 0 && (
        <section className="mx-auto max-w-5xl p-8">
          <h2 className="text-2xl font-bold mb-6">Our Partners</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
            {foundationPartners.map((partner: Partner) => (
              <a
                key={partner._id}
                href={partner.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center p-4 bg-white rounded shadow hover:shadow-lg transition-shadow"
                title={partner.name}
              >
                {partner.logo ? (
                  <Image
                    src={urlFor(partner.logo)
                      .width(200)
                      .height(100)
                      .auto("format")
                      .url()}
                    alt={partner.name}
                    width={200}
                    height={100}
                    style={{ objectFit: "contain" }}
                    placeholder="blur"
                    blurDataURL={urlFor(partner.logo)
                      .width(200)
                      .height(100)
                      .blur(20)
                      .url()}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-gray-700">{partner.name}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
