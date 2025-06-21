"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { client } from "../../sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import styles from "./page.module.scss";

type GalleryImage = {
  _id: string;
  image: any;
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
  if (tagSlugs.length === 0) {
    const query = `*[_type == "galleryImage"]{
      _id,
      image,
      "tags": tags[]->slug.current
    }`;
    const results = await client.fetch(query);
    return results.map((item: any) => ({
      _id: item._id,
      image: item.image,
      tag: item.tags?.[0] || "untagged",
      tags: item.tags || [],
    }));
  }

  const query = `*[_type == "galleryImage" && count((tags[]->slug.current)[@ in $tagSlugs]) == $tagCount]{
    _id,
    image,
    "tags": tags[]->slug.current
  }`;

  const results = await client.fetch(query, {
    tagSlugs,
    tagCount: tagSlugs.length,
  });

  return results.map((item: any) => ({
    _id: item._id,
    image: item.image,
    tag: item.tags?.[0] || "untagged",
    tags: item.tags || [],
  }));
};

const fetchAllTags = async (): Promise<Tag[]> => {
  const query = `*[_type == "tag"]{_id, name, slug, description}`;
  return client.fetch(query);
};

const GalleryPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tagParams = searchParams.getAll("tag").slice(0, 2);

  // Flat array of images
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImages(tagParams).then(setGalleryImages);
  }, [tagParams.join(",")]);

  useEffect(() => {
    fetchAllTags().then(setAllTags);
  }, []);

  // Find descriptions of active filters if any
  const activeTagDescriptions = tagParams
    .map((slug) => allTags.find((tag) => tag.slug.current === slug))
    .filter((tag): tag is Tag => tag !== undefined && !!tag.description)
    .map((tag) => tag.description);

  const toggleTag = (slug: string) => {
    let newTags = [...tagParams];
    if (newTags.includes(slug)) {
      newTags = newTags.filter((t) => t !== slug);
    } else if (newTags.length < 2) {
      newTags.push(slug);
    }
    updateQueryParams(newTags);
  };

  const clearFilters = () => {
    updateQueryParams([]);
  };

  const updateQueryParams = (tags: string[]) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("tag");
    tags.forEach((tag) => url.searchParams.append("tag", tag));
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <main className={`${styles.container} ${styles.main}`}>
      <h1 className={styles.title}>Gallery</h1>

      {/* Tag Cloud */}
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
          <button onClick={clearFilters} className={`${styles.clearButton}`}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Active filters display */}
      {tagParams.length > 0 && (
        <div className={styles.activeFilters}>
          <p>
            Filtering by: <strong>{tagParams.join(" + ")}</strong>
          </p>
        </div>
      )}

      {/* Show descriptions of active filters if available */}
      {activeTagDescriptions.length > 0 && (
        <div className={styles.filterDescriptions}>
          {activeTagDescriptions.map((desc, i) => (
            <p key={i} className={styles.filterDescription}>
              {desc}
            </p>
          ))}
        </div>
      )}

      {/* Gallery Images - flat grid */}
      <div className={styles.grid}>
        {galleryImages.map((image) => {
          const thumbnailUrl = urlFor(image.image)
            .width(400)
            .height(250)
            .auto("format")
            .url();
          const fullImageUrl = urlFor(image.image).auto("format").url();

          return (
            <div
              key={image._id}
              onClick={() => setSelectedImage(fullImageUrl)}
              className={styles.imageWrapper}
            >
              <Image
                src={thumbnailUrl}
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
