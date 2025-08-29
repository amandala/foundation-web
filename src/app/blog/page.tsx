import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import Image from "next/image";

import { client } from "@/sanity/client";
import { PageHeader } from "../components/PageHeader/PageHeader";

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

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <PageHeader title="Blog" />
      <ul className="flex flex-col gap-y-24 pt-8">
        {posts.map((post) => (
          <li className="hover:underline" key={post._id}>
            <Link href={`/blog/${post.slug.current}`}>
              <div className="flex flex-row justify-between">
                <h2 className="text-xl font-semibold grow">{post.title}</h2>
                <p>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-600">{post.description}</p>
              </div>
              <Image
                src={post.imageUrl}
                alt={post.title}
                className="mt-2 w-full h-auto rounded-lg"
                width={800}
                height={600}
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
