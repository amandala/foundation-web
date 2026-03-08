"use client";

import styles from "./styles.module.scss";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "../../sanity/client";
import { GalleryImage, Tag } from "../types";
import { Gallery } from "./Gallery";
import { PageHeader } from "../components/PageHeader/PageHeader";
import { ArtistSearch } from "./ArtistSearch";

const PAGE_SIZE = 40;

const fetchGalleryImages = async (
  tagSlugs: string[] = [],
  offset: number = 0,
  limit: number = PAGE_SIZE
): Promise<GalleryImage[]> => {
  const tagCount = tagSlugs.length;
  const start = offset;
  const end = offset + limit;
  const query =
    tagCount === 0
      ? `*[_type == "galleryImage"] | order(_createdAt desc) [$start...$end]{ _id, image, "tags": tags[]->slug.current, caption, photoCredit }`
      : `*[_type == "galleryImage" && count((tags[]->slug.current)[@ in $tagSlugs]) == $tagCount] | order(_createdAt desc) [$start...$end]{
        _id, image, "tags": tags[]->slug.current, caption, photoCredit
      }`;

  const results = await client.fetch(
    query,
    { tagSlugs, tagCount, start, end },
    { cache: "no-store" }
  );

  return results.map((item: GalleryImage) => ({
    _id: item._id,
    image: item.image,
    tag: item.tags?.[0] || "untagged",
    tags: item.tags || [],
    caption: item.caption || "",
    photoCredit: item.photoCredit || "",
  }));
};

const fetchAllTags = async (): Promise<Tag[]> => {
  return client.fetch(`*[_type == "tag" && defined(slug.current) && count(*[_type == "galleryImage" && references(^._id)]) > 0]{_id, name, slug, description}`);
};

const GalleryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tagParams = useMemo(() => {
    return searchParams.getAll("tag").slice(0, 2);
  }, [searchParams]);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  // Reset and fetch first page when filters change
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    setIsLoading(true);
    fetchGalleryImages(tagParams, 0).then((images) => {
      setGalleryImages(images);
      setHasMore(images.length === PAGE_SIZE);
      offsetRef.current = images.length;
      setIsLoading(false);
    });
  }, [tagParams]);

  useEffect(() => {
    fetchAllTags().then(setAllTags);
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    fetchGalleryImages(tagParams, offsetRef.current).then((images) => {
      setGalleryImages((prev) => {
        const existingIds = new Set(prev.map((img) => img._id));
        const newImages = images.filter((img) => !existingIds.has(img._id));
        return [...prev, ...newImages];
      });
      setHasMore(images.length === PAGE_SIZE);
      offsetRef.current += images.length;
      setIsLoading(false);
    });
  }, [isLoading, hasMore, tagParams]);

  const activeTags = tagParams
    .map((slug) => allTags.find((tag) => tag.slug?.current === slug))
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
    specialTagSlugs.includes(tag?.slug?.current)
  );
  const otherTags = allTags
    .filter((tag) => !specialTagSlugs?.includes(tag?.slug?.current))
    .sort((a, b) => a.name?.localeCompare(b.name));

  return (
    <main className={styles.container}>
      <PageHeader title="Gallery" />
      <div className="my-4">
        <h2 className="text-2xl font-bold mb-2">Filters</h2>
        <p className={styles.filterHint}>
          Filter by era or search for an artist. Combine up to 2 filters to find collaborations.
        </p>

        <div className={styles.filterRow}>
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
                {isActive && <span className={styles.removeX}>&times;</span>}
              </button>
            );
          })}
          {activeTags
            .filter((tag) => !specialTagSlugs.includes(tag.slug.current))
            .map((tag) => (
              <button
                key={tag._id}
                onClick={() => toggleTag(tag.slug.current)}
                className={`${styles.tagButton} ${styles.activeTag}`}
              >
                {tag.name}
                <span className={styles.removeX}>&times;</span>
              </button>
            ))}
          <ArtistSearch
            tags={otherTags}
            activeSlugs={tagParams}
            onSelect={toggleTag}
            disabled={tagParams.length >= 2}
          />
          {tagParams.length > 0 && (
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      <Gallery galleryImages={galleryImages} onLoadMore={loadMore} isLoading={isLoading} hasMore={hasMore} />
      {activeTags.length > 0 && (
        <div>
          {activeTags.map(
            (tag, i) =>
              tag.description && (
                <div key={i} className="mt-12">
                  <p className="text-2xl font-bold">{tag.name}</p>
                  <p>{tag.description}</p>
                </div>
              )
          )}
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
