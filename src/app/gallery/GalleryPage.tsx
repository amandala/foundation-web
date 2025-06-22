"use client";

import styles from "./styles.module.scss";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "../../sanity/client";
import { GalleryImage, Tag } from "../types";
import { Gallery } from "./Gallery";

const fetchGalleryImages = async (
  tagSlugs: string[] = []
): Promise<GalleryImage[]> => {
  const tagCount = tagSlugs.length;
  const query =
    tagCount === 0
      ? `*[_type == "galleryImage"]{ _id, image, "tags": tags[]->slug.current, caption }`
      : `*[_type == "galleryImage" && count((tags[]->slug.current)[@ in $tagSlugs]) == $tagCount]{
        _id, image, "tags": tags[]->slug.current, caption
      }`;

  const results = await client.fetch(query, { tagSlugs, tagCount });

  return results.map((item: GalleryImage) => ({
    _id: item._id,
    image: item.image,
    tag: item.tags?.[0] || "untagged",
    tags: item.tags || [],
    caption: item.caption || "",
  }));
};

const fetchAllTags = async (): Promise<Tag[]> => {
  return client.fetch(`*[_type == "tag"]{_id, name, slug, description}`);
};

const GalleryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tagParams = useMemo(() => {
    return searchParams.getAll("tag").slice(0, 2);
  }, [searchParams]);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const sortGalleryImagesByCaption = (
    images: GalleryImage[]
  ): GalleryImage[] => {
    return images.sort((a, b) => {
      const captionA = a.caption?.toLowerCase() || "";
      const captionB = b.caption?.toLowerCase() || "";
      return captionA.localeCompare(captionB);
    });
  };

  useEffect(() => {
    fetchGalleryImages(tagParams)
      .then(sortGalleryImagesByCaption)
      .then(setGalleryImages);
  }, [tagParams]);

  useEffect(() => {
    fetchAllTags().then(setAllTags);
  }, []);

  const activeTags = tagParams
    .map((slug) => allTags.find((tag) => tag.slug.current === slug))
    .filter((tag): tag is Tag => !!tag);

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

  const specialTagSlugs = ["oldschool", "newschool"];
  const specialTags = allTags.filter((tag) =>
    specialTagSlugs.includes(tag.slug.current)
  );
  const otherTags = allTags
    .filter((tag) => !specialTagSlugs.includes(tag.slug.current))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className={`${styles.container} ${styles.main}`}>
      <h1 className={styles.title}>
        <span className="text-4xl font-bold">Gallery </span>
        {tagParams.length > 0 && (
          <span className={styles.activeFilters}>
            Filtering by: <strong>{tagParams.join(" + ")}</strong>
          </span>
        )}
        {tagParams.length > 0 && (
          <button onClick={clearFilters} className={styles.clearButton}>
            Clear Filters
          </button>
        )}
      </h1>

      <div className={styles.tagCloud}>
        {/* Special Tags Row */}
        <div className={styles.specialTagRow}>
          {specialTags.map((tag) => {
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
        </div>

        {/* All Other Tags */}
        <div className={styles.otherTags}>
          {otherTags.map((tag) => {
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
        </div>
      </div>

      <Gallery galleryImages={galleryImages} />

      {activeTags.length > 0 && (
        <div>
          {activeTags.map(
            (tag, i) =>
              tag.description && (
                <div key={i} className={styles.filterDescriptions}>
                  <p className={styles.filterTitle}>{tag.name}</p>
                  <p className={styles.filterDescription}>{tag.description}</p>
                </div>
              )
          )}
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
