"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { GalleryImage } from "../types";
import styles from "./styles.module.scss";
import { useSwipeable } from "react-swipeable";

export const Gallery = ({
  galleryImages,
  onLoadMore,
  isLoading = false,
  hasMore = false,
}: {
  galleryImages: GalleryImage[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex < galleryImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
    if (selectedIndex >= galleryImages.length - 5 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [selectedIndex, galleryImages.length, hasMore, onLoadMore]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard arrow & escape support
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, handleClose]);

  // Swipe gesture support
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  // Infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <div>
      <div
        className="grid gap-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        {galleryImages.map((image, index) => {
          if (!image.image) return null;
          const thumbnail = urlFor(image.image)
            .width(400)
            .height(250)
            .auto("format")
            .url();

          return (
            <div
              key={image._id}
              onClick={() => setSelectedIndex(index)}
              className={styles.imageWrapper}
            >
              <Image
                src={thumbnail}
                alt={image.caption || "Gallery Image"}
                width={400}
                height={250}
                className={styles.image}
              />
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div ref={sentinelRef}>
          {isLoading && (
            <div
              className="grid gap-1 mt-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={styles.skeleton}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {selectedIndex !== null && selectedIndex < galleryImages.length && (
        <div
          className={styles.modalOverlay}
          onClick={handleClose}
          {...swipeHandlers}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(galleryImages[selectedIndex].image)
                .width(1200)
                .auto("format")
                .url()}
              alt={galleryImages[selectedIndex].caption || "Full image"}
              width={1200}
              height={800}
              className={styles.modalImage}
              style={{ objectFit: "contain" }}
              priority
            />

            {/* Caption & Credit */}
            <div className="text-center mt-4">
              {galleryImages[selectedIndex].photoCredit && (
                <p className="text-lg text-white">
                  📸 {galleryImages[selectedIndex].photoCredit}
                </p>
              )}
              {galleryImages[selectedIndex].caption && (
                <p className="text-lg text-white">
                  {galleryImages[selectedIndex].caption}
                </p>
              )}
            </div>

            {/* Arrows */}
            <div className="hidden md:block">
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-[-3rem] transform -translate-y-1/2 text-white text-3xl font-bold hover:text-green-400"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-[-3rem] transform -translate-y-1/2 text-white text-3xl font-bold hover:text-green-400"
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            {/* Mobile arrows */}
            <div className="flex justify-center gap-8 mt-4 md:hidden">
              <button
                onClick={handlePrev}
                className="text-white text-3xl font-bold hover:text-green-400"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="text-white text-3xl font-bold hover:text-green-400"
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
