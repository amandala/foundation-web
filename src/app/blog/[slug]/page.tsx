// File: /app/[slug]/page.tsx

import { PortableText } from "next-sanity";
import { urlFor } from "@/sanity/image";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Gallery } from "@/app/gallery/Gallery";
import type { Metadata } from "next";
import { createShareMetadata, SITE_DESCRIPTION } from "../../share-metadata";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  description,
  publishedAt,
  mainImage,
  "imageUrl": mainImage.asset->url,
  event->{
    _id,
    name,
    slug,
    "coverImageUrl": coverImage.asset->url,
    description
  },
  tags[]->{
    _id,
    title
  },
  featuredGalleryImages[]->{
    _id,
    image,
    caption,
    photoCredit,
    "tags": tags[]->slug.current
  }
}`;

const options = { next: { revalidate: 30 } };

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{title, description, publishedAt, mainImage}`,
    { slug },
    options
  );

  if (!post) {
    return { title: "Post not found" };
  }

  return createShareMetadata({
    title: post.title,
    description: post.description || SITE_DESCRIPTION,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    image: post.mainImage
      ? {
          url: urlFor(post.mainImage)
            .width(1200)
            .height(630)
            .fit("crop")
            .auto("format")
            .url(),
          width: 1200,
          height: 630,
          alt: post.title,
        }
      : undefined,
  });
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

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/blog" className="hover:underline">
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
        <p className="text-xl font-bold mb-4">
          Published:{" "}
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {Array.isArray(post.body) && (
          <div className="pt-4 space-y-4">
            <PortableText value={post.body} />
          </div>
        )}
      </div>
      {post.featuredGalleryImages && post.featuredGalleryImages.length > 0 && (
        <Gallery galleryImages={post.featuredGalleryImages} />
      )}
    </main>
  );
}
