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
    <main className="container mx-auto min-h-screen max-w-4xl p-8 flex flex-col gap-4">
      <PageHeader title={event.name} size="small" />
      {eventImageUrl && (
        <div className="mx-auto max-w-[500px]">
          <Image
            src={eventImageUrl}
            alt={event.name}
            className="mt-2 w-full h-auto rounded-lg object-contain"
            width={500}
            height={300}
            priority
          />
        </div>
      )}

      <div className="prose">
        <p className="text-xl font-bold mb-4">
          {new Date(event.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
          })}

          <span> - </span>

          {new Date(event.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
          })}
        </p>

        <div>
          <Link
            target="_blank"
            href={event.mapLink}
            className="hover:underline inline-flex items-center gap-1"
          >
            <MapPinIcon className="w-5 h-5 text-gray-600 " />
            <span>{event.address}</span>
          </Link>
        </div>
      </div>
      <div>
        {Array.isArray(event.description) && (
          <div className="pt-4 space-y-4">
            <PortableText
              value={event.description}
              components={portableComponents}
            />
          </div>
        )}
      </div>
      {event.featuredGalleryImages &&
        event.featuredGalleryImages.length > 0 && (
          <Gallery galleryImages={event.featuredGalleryImages} />
        )}
      {event.eventPartners && event.eventPartners.length > 0 && (
        <PartnerGrid partners={event.eventPartners} />
      )}
    </main>
  );
}
