// File: /app/[slug]/page.tsx

import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Partner } from "@/app/types";
import { Gallery } from "@/app/gallery/Gallery";
import { PageHeader } from "@/app/components/PageHeader/PageHeader";

import { MapPinIcon } from "@heroicons/react/24/solid";

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
    logo {
      asset-> {
        _id,
        url
      }
    },
    website
  }
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const event = await client.fetch(EVENT_QUERY, { slug: resolvedParams.slug });

  if (!resolvedParams?.slug) {
    return <div>Error: No slug provided.</div>;
  }

  if (!event) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p className="text-red-500">Post not found.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to posts
        </Link>
      </main>
    );
  }

  const eventImageUrl = event.coverImageUrl
    ? urlFor(event.coverImageUrl)?.width(550).height(550).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-4xl p-8 flex flex-col gap-4">
      <PageHeader title={event.name} />
      {eventImageUrl && (
        <Image
          src={eventImageUrl}
          alt={event.name}
          className="mt-2 w-full h-auto rounded-lg"
          width={800}
          height={600}
        />
      )}

      <div className="prose">
        <p className="text-1xl font-bold mb-4">
          {new Date(event.startDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}

          <span> - </span>

          {new Date(event.endDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
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
            <PortableText value={event.description} />
          </div>
        )}
      </div>
      {event.featuredGalleryImages &&
        event.featuredGalleryImages.length > 0 && (
          <Gallery galleryImages={event.featuredGalleryImages} />
        )}
      {event.eventPartners && event.eventPartners.length > 0 && (
        <section className="mx-auto max-w-5xl p-8">
          <h2 className="text-2xl font-bold mb-6">Event Partners</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
            {event.eventPartners.map((partner: Partner) => (
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
                    src={
                      urlFor(partner.logo)
                        ?.width(200)
                        ?.height(100)
                        ?.auto("format")
                        ?.url() || ""
                    }
                    alt={partner.name}
                    width={200}
                    height={100}
                    style={{ objectFit: "contain" }}
                    placeholder="blur"
                    blurDataURL={
                      urlFor(partner.logo)
                        ?.width(200)
                        ?.height(100)
                        ?.blur(20)
                        ?.url() || ""
                    }
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
