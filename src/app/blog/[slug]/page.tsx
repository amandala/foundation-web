// File: /app/[slug]/page.tsx

import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  publishedAt,
  "imageUrl": mainImage.asset->url,
  event->{
    _id,
    name,
    slug,
    "coverImageUrl": coverImage.asset->url,
    description,
  },
  tags[]->{
    _id,
    title
  }
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
  const post = await client.fetch(
    POST_QUERY,
    { slug: resolvedParams.slug },
    options
  );

  if (!resolvedParams?.slug) {
    return <div>Error: No slug provided.</div>;
  }

  if (!post) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p className="text-red-500">Post not found.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to posts
        </Link>
      </main>
    );
  }

  const postImageUrl = post.imageUrl
    ? urlFor(post.imageUrl)?.width(550).height(550).url()
    : null;

  console.log("Fetched post:", post);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>

      {postImageUrl && (
        <Image
          src={postImageUrl}
          alt={post.title}
          className="mt-2 w-full h-auto rounded-lg"
          width={800}
          height={600}
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="prose">
        <p className="text-1xl font-bold mb-4">
          Published: {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        {Array.isArray(post.body) && (
          <div className="pt-4 space-y-4">
            <PortableText value={post.body} />
          </div>
        )}
      </div>
      <h2>{post.endDate}</h2>
    </main>
  );
}
