import React from "react";
import Image from "next/image";
import { client } from "../sanity/client";
import { urlFor } from "../sanity/image";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import type { HomePage } from "./types";
import { Gallery } from "./gallery/Gallery";
import styles from "./page.module.scss";
import PartnerGrid from "./components/Partners";

function urlForFile(source: { asset?: { _ref?: string; url?: string } }) {
  if (source?.asset?.url) return source.asset.url;
  if (!source?.asset?._ref) return "";
  const ref = source.asset._ref;
  const [, id, ext] = ref.split("-");
  const { projectId, dataset } = client.config();
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
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
    image,
    link,
    order
  }
}`;

export default async function Home() {
  const data = await client.fetch<HomePage>(query, {}, { next: { revalidate: 30 } });

  if (!data) return <p className="text-center text-red-500 m-24">No data found</p>;

  const { heroMedia, introText, featuredEvent, featuredPosts, featuredGalleryImages } = data;
  const foundationPartners = data.foundationPartners
    ? [...data.foundationPartners].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <>
      <main className="relative min-h-screen z-10">
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
        <section className="mx-auto relative py-12 mt-24">
          <div className={styles.textBg}>FOUNDATION COLLECTIVE</div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-center mb-8">
              Foundation Collective
            </h1>
            <div className="prose mx-auto p-8">
              <PortableText value={(introText || []) as PortableTextBlock[]} />
            </div>
          </div>
        </section>

        {/* Featured Event Section */}
        {featuredEvent && (
          <section className="mx-auto max-w-[500px] p-4">
            <a
              href={`/events/${featuredEvent.slug}`}
              className="block bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow"
            >
              {featuredEvent.coverImage && (
                <Image
                  src={urlFor(featuredEvent.coverImage).width(500).url()}
                  alt={featuredEvent.name}
                  width={500}
                  height={300}
                  className="w-full h-auto object-contain"
                  placeholder="blur"
                  blurDataURL={urlFor(featuredEvent.coverImage).width(500).blur(20).url()}
                  loading="lazy"
                />
              )}
              <div className="p-4 text-center">
                <h3 className="text-xl font-semibold">{featuredEvent.name}</h3>
                <p className="text-gray-600">
                  {new Date(featuredEvent.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                  })}
                  <span> - </span>
                  {new Date(featuredEvent.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                  })}
                </p>
              </div>
            </a>
          </section>
        )}

        {/* Featured Gallery Images Section */}
        {featuredGalleryImages && featuredGalleryImages.length > 0 && (
          <div className="py-12">
            <Gallery
              galleryImages={featuredGalleryImages.map((img) => ({
                ...img,
                tags: img.tags || [],
              }))}
            />
          </div>
        )}

        {/* Featured Blog Posts Section */}
        {featuredPosts && featuredPosts.length > 0 && (
          <section className="mx-auto max-w-3xl p-8">
            <h2 className="text-2xl font-bold mb-4">Blog Highlights</h2>
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
                      loading="lazy"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p className="text-gray-600">
                      Published:{" "}
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Foundation Partners Section */}
        {foundationPartners.length > 0 && (
          <section className="mx-auto max-w-5xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Foundation Partners
            </h2>
            <PartnerGrid partners={foundationPartners} />
          </section>
        )}
      </main>
    </>
  );
}
