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
};

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
  contactEmail,
  socialLinks,
  featuredEvent->{
    name,
    "slug": slug.current,
    coverImage,
    startDate,
    endDate,
    description
  }
}`;

export default function HomePage() {
  const [data, setData] = useState<HomePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(query).then((res) => {
      console.log("Fetched home page data:", res);
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found</p>;

  const { heroMedia, introText, featuredEvent, contactEmail, socialLinks } =
    data;

  return (
    <main className="min-h-screen">
      {heroMedia?.type === "image" && heroMedia.image && (
        <Image
          src={urlFor(heroMedia.image).width(1200).url()}
          alt="Hero"
          width={1200}
          height={400}
          style={{ width: "100%", height: "auto" }}
          placeholder="blur"
          blurDataURL={urlFor(heroMedia.image).width(1200).blur(20).url()}
          loading="eager"
          quality={80}
          className="hero-image"
          onError={(e) => {
            console.error("Error loading hero image:", e);
            e.currentTarget.src = "/fallback-image.jpg"; // Fallback image
          }}
          onLoadingComplete={() => {
            console.log("Hero image loaded successfully");
          }}
          onLoad={() => {
            console.log("Hero image onLoad event triggered");
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            console.log("Right-click disabled on hero image");
          }}
        />
      )}
      {heroMedia?.type === "video" && heroMedia.video && (
        <video style={{ width: "100%", height: "auto" }} loop muted autoPlay>
          <source src={urlForFile(heroMedia?.video)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <h1 className="text-4xl font-bold text-center my-8">
        Foundation Collective
      </h1>

      <section className="mx-auto max-w-3xl p-8">
        <PortableText value={introText} />
      </section>

      {featuredEvent && (
        <section className="mx-auto max-w-3xl p-8 center">
          {featuredEvent.coverImage && (
            <Image
              src={urlFor(featuredEvent.coverImage).width(800).url()}
              alt={featuredEvent.name}
              width={200}
              height={300}
              className="mb-4 rounded-lg"
              placeholder="blur"
              blurDataURL={urlFor(featuredEvent.coverImage)
                .width(800)
                .blur(20)
                .url()}
              loading="lazy"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
          <p>
            Start: {new Date(featuredEvent.startDate).toLocaleString()} <br />
            End: {new Date(featuredEvent.endDate).toLocaleString()}
          </p>
          <PortableText value={featuredEvent.description} />
          <p>
            <a href={`/events/${featuredEvent.slug}`}>View Event Details</a>
          </p>
        </section>
      )}

      {contactEmail && (
        <section className="mx-auto max-w-3xl p-8">
          <p>
            Contact us <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
        </section>
      )}

      {socialLinks && socialLinks.length > 0 && (
        <footer className="container mx-auto max-w-3xl p-8">
          <h3>Follow Us</h3>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              gap: "1rem",
              padding: 0,
            }}
          >
            {socialLinks.map(({ type, url, icon }, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {icon ? (
                    <Image
                      src={urlFor(icon).width(24).height(24).url()}
                      alt={type}
                      width={24}
                      height={24}
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : (
                    type
                  )}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </main>
  );
}
