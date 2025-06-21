"use client";

import styles from "./styles.module.scss";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "../../sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

type GalleryImage = {
  _id: string;
  image: SanityImageSource;
  tag: string;
  tags: string[];
};

type Tag = {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
};

const builder = imageUrlBuilder(client);
const urlFor = (source: any) => builder.image(source);

const fetchGalleryImages = async (
  tagSlugs: string[] = []
): Promise<GalleryImage[]> => {
  const tagCount = tagSlugs.length;
  const query =
    tagCount === 0
      ? `*[_type == "galleryImage"]{ _id, image, "tags": tags[]->slug.current }`
      : `*[_type == "galleryImage" && count((tags[]->slug.current)[@ in $tagSlugs]) == $tagCount]{
          _id, image, "tags": tags[]->slug.current
        }`;

  const results = await client.fetch(query, { tagSlugs, tagCount });

  return results.map((item: any) => ({
    _id: item._id,
    image: item.image,
    tag: item.tags?.[0] || "untagged",
    tags: item.tags || [],
  }));
};

const fetchAllTags = async (): Promise<Tag[]> => {
  return client.fetch(`*[_type == "tag"]{_id, name, slug, description}`);
};

const GalleryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParams = searchParams.getAll("tag").slice(0, 2);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImages(tagParams).then(setGalleryImages);
  }, [tagParams.join(",")]);

  useEffect(() => {
    fetchAllTags().then(setAllTags);
  }, []);

  const activeTagDescriptions = tagParams
    .map((slug) => allTags.find((tag) => tag.slug.current === slug))
    .filter((tag): tag is Tag => !!tag?.description)
    .map((tag) => tag!.description!);

  const updateQueryParams = (tags: string[]) => {
    const params = new URLSearchParams();
    tags.forEach((tag) => params.append("tag", tag));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggleTag = (slug: string) => {
    const updated = tagParams.includes(slug)
      ? tagParams.filter((t) => t !== slug)
      : tagParams.length < 2
        ? [...tagParams, slug]
        : tagParams;
    updateQueryParams(updated);
  };

  const clearFilters = () => updateQueryParams([]);

  return (
    <main className={`${styles.container} ${styles.main}`}>
      <h1 className={styles.title}>Gallery</h1>

      <div className={styles.tagCloud}>
        {allTags.map((tag) => {
          const isActive = tagParams.includes(tag.slug.current);
          return (
            <button
              key={tag._id}
              onClick={() => toggleTag(tag.slug.current)}
              className={`${styles.tagButton} ${
                isActive ? styles.activeTag : ""
              }`}
            >
              {tag.name}
            </button>
          );
        })}

        {tagParams.length > 0 && (
          <button onClick={clearFilters} className={styles.clearButton}>
            Clear Filters
          </button>
        )}
      </div>

      {tagParams.length > 0 && (
        <div className={styles.activeFilters}>
          <p>
            Filtering by: <strong>{tagParams.join(" + ")}</strong>
          </p>
        </div>
      )}

      {activeTagDescriptions.length > 0 && (
        <div className={styles.filterDescriptions}>
          {activeTagDescriptions.map((desc, i) => (
            <p key={i} className={styles.filterDescription}>
              {desc}
            </p>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {galleryImages.map((image) => {
          if (!image.image) return null;
          const thumbnail = urlFor(image.image)
            .width(400)
            .height(250)
            .auto("format")
            .url();
          const full = urlFor(image.image).auto("format").url();

          return (
            <div
              key={image._id}
              onClick={() => setSelectedImage(full)}
              className={styles.imageWrapper}
            >
              <Image
                src={thumbnail}
                alt={image.tag}
                width={400}
                height={250}
                className={styles.image}
              />
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt="Large view"
            width={800}
            height={600}
            className={styles.modalImage}
            style={{ objectFit: "contain", cursor: "pointer" }}
            priority
          />
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
