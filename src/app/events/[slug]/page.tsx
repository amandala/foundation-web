// File: /app/[slug]/page.tsx

import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";

const EVENT_QUERY = `*[_type == "event" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  "coverImageUrl": coverImage.asset->url,
  description,
  startDate,
  endDate,
   featuredGalleryImages[]->{
    _id,
    image,
    caption,
    photoCredit,
    "tags": tags[]->slug.current
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
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to home
      </Link>

      {eventImageUrl && (
        <Image
          src={eventImageUrl}
          alt={event.name}
          className="mt-2 w-full h-auto rounded-lg"
          width={800}
          height={600}
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
      <div className="prose">
        <p className="text-1xl font-bold mb-4">
          Starts: {new Date(event.startDate).toLocaleDateString()}
        </p>
        <p className="text-1xl font-bold mb-4">
          Ends: {new Date(event.endDate).toLocaleDateString()}
        </p>
        {Array.isArray(event.description) && (
          <div className="pt-4 space-y-4">
            <PortableText value={event.description} />
          </div>
        )}
      </div>
      {event.featuredGalleryImages &&
        event.featuredGalleryImages.length > 0 && (
          <section className="mx-auto max-w-5xl p-8">
            <h2 className="text-2xl font-bold mb-6">Featured Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {event.featuredGalleryImages.map(
                (img: {
                  _id: string;
                  image: SanityImageSource;
                  caption?: string;
                  photoCredit?: string;
                }) => {
                  const thumbUrl: string =
                    urlFor(img.image)
                      ?.width(400)
                      .height(250)
                      .auto("format")
                      .url() || "";
                  return (
                    <div
                      key={img._id}
                      className="rounded-lg overflow-hidden shadow hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={thumbUrl}
                        alt={img.caption || "Featured image"}
                        width={400}
                        height={250}
                        style={{ objectFit: "cover" }}
                        placeholder="blur"
                        blurDataURL={
                          urlFor(img.image)
                            ?.width(400)
                            ?.height(250)
                            ?.blur(20)
                            ?.url() || ""
                        }
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
                }
              )}
            </div>
          </section>
        )}
    </main>
  );
}
