"use client";

import { useState } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "../../sanity/client";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { GalleryImage } from "../types";
import styles from "./styles.module.scss";

export const Gallery = ({
  galleryImages,
}: {
  galleryImages: GalleryImage[];
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const builder = imageUrlBuilder(client);
  const urlFor = (source: SanityImageSource) => builder.image(source);

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  return (
    <div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${4}, minmax(0, 1fr))`,
        }}
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

      {selectedIndex !== null && (
        <div className={styles.modalOverlay} onClick={handleClose}>
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
            <div className="text-center text-white mt-4">
              {galleryImages[selectedIndex].caption && (
                <p className="text-lg">
                  {galleryImages[selectedIndex].caption}
                </p>
              )}
              {galleryImages[selectedIndex].photoCredit && (
                <p className="text-sm italic text-gray-300">
                  {galleryImages[selectedIndex].photoCredit}
                </p>
              )}
            </div>
            {/* Arrow Controls */}
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
        </div>
      )}
    </div>
  );
};
