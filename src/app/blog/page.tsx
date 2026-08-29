import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import Image from "next/image";

import { client } from "@/sanity/client";
import { PageHeader } from "../components/PageHeader/PageHeader";
import type { Metadata } from "next";
import { createShareMetadata } from "../share-metadata";

export const metadata: Metadata = createShareMetadata({
  title: "Blog",
  description: "Stories, updates, and perspectives from Foundation Collective.",
  path: "/blog",
});

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc)[0...10] {
  _id,
  title,
  slug,
  description,
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

const options = { next: { revalidate: 30 } };

export default async function BlogPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  if (posts.length === 0) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <PageHeader title="Blog" imageSrc="/blog.png" />
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">
            No posts yet — stay tuned!
          </p>
          <p className="text-gray-500">
            Follow us on social media for the latest updates and announcements.
            Check the links in the footer below.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <PageHeader title="Blog" imageSrc="/blog.png" />
      <ul className="flex flex-col gap-y-24 pt-8">
        {posts.map((post) => (
          <li className="hover:underline" key={post._id}>
            <Link href={`/blog/${post.slug.current}`}>
              <div className="flex flex-row justify-between items-baseline gap-4">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-sm text-gray-500 shrink-0">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {post.description && (
                <p className="text-gray-600 mt-1">{post.description}</p>
              )}
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  className="mt-2 w-full h-auto rounded-lg"
                  width={800}
                  height={600}
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
