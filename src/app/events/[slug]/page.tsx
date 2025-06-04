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
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const event = await client.fetch(
    EVENT_QUERY,
    { slug: resolvedParams.slug },
    options
  );

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
    </main>
  );
}
