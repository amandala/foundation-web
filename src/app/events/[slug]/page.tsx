// File: /app/[slug]/page.tsx

import { PortableText } from "next-sanity";
import { urlFor } from "@/sanity/image";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Gallery } from "@/app/gallery/Gallery";
import { PageHeader } from "@/app/components/PageHeader/PageHeader";
import type { PortableTextMarkComponentProps } from "@portabletext/react";

import { MapPinIcon } from "@heroicons/react/24/solid";
import PartnerGrid from "@/app/components/Partners";

const EVENT_QUERY = `*[_type == "event" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  "coverImageUrl": coverImage.asset->url,
  description,
  startDate,
  endDate,
  address, 
  mapLink,
  featuredGalleryImages[]->{
    _id,
    image,
    caption,
    photoCredit,
    "tags": tags[]->slug.current
  },
  eventPartners[]->{
    _id,
    name,
    image,
    link
  }
}`;

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;
  const event = await client.fetch(
    EVENT_QUERY,
    { slug: resolvedParams.slug },
    { cache: "no-store" }
  );

  if (!resolvedParams?.slug) {
    return <div>Error: No slug provided.</div>;
  }

  if (!event) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p className="text-red-500">Event not found.</p>
        <Link href="/events" className="text-blue-500 hover:underline">
          ← Back to events
        </Link>
      </main>
    );
  }

  const eventImageUrl = event.coverImageUrl
    ? urlFor(event.coverImageUrl).width(900).auto("format").url()
    : null;

  const portableComponents = {
    types: {},
    marks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      link: ({ children, value }: PortableTextMarkComponentProps<any>) => {
        const href = value?.href || "#";
        return (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="hover:underline text-blue-600 font-bold"
          >
            {children}
          </a>
        );
      },
    },
  };

  return (
    <main className="min-h-screen">
      {/* Event Header — side by side on desktop, stacked on mobile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Poster + Partners (desktop) */}
          <div className={`lg:w-2/5 flex-shrink-0 ${eventImageUrl ? "" : "hidden lg:block"}`}>
            {eventImageUrl && (
              <Image
                src={eventImageUrl}
                alt={event.name}
                className="w-full h-auto rounded-lg object-contain"
                width={900}
                height={600}
                priority
              />
            )}
            {event.eventPartners && event.eventPartners.length > 0 && (
              <div className="hidden lg:block mt-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Partners</h2>
                <PartnerGrid partners={event.eventPartners} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className={`flex flex-col ${eventImageUrl ? "lg:w-3/5" : "w-full"}`}>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {event.name}
            </h1>

            <p className="text-lg font-semibold mb-2">
              {new Date(event.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
              })}
              {" — "}
              {new Date(event.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
              })}
            </p>

            {event.address && (
              <Link
                target="_blank"
                href={event.mapLink}
                className="hover:underline inline-flex items-center gap-1 text-gray-600 mb-6"
              >
                <MapPinIcon className="w-5 h-5" />
                <span>{event.address}</span>
              </Link>
            )}

            {Array.isArray(event.description) && (
              <div className="prose prose-lg max-w-none space-y-4">
                <PortableText
                  value={event.description}
                  components={portableComponents}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {event.featuredGalleryImages &&
        event.featuredGalleryImages.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <h2 className="text-2xl font-bold mb-4">Gallery</h2>
            <Gallery galleryImages={event.featuredGalleryImages} />
          </div>
        )}

      {/* Partners Section (mobile only) */}
      {event.eventPartners && event.eventPartners.length > 0 && (
        <div className="lg:hidden max-w-3xl mx-auto px-8 py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Partners</h2>
          <PartnerGrid partners={event.eventPartners} />
        </div>
      )}
    </main>
  );
}
