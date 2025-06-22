import { useState } from "react";

import { GalleryImage } from "../types";
import Image from "next/image";
import { client } from "../../sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import styles from "./styles.module.scss";

export const Gallery = ({
  galleryImages,
}: {
  galleryImages: GalleryImage[];
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const builder = imageUrlBuilder(client);
  const urlFor = (source: SanityImageSource) => builder.image(source);

  return (
    <div>
      <div
        className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(${galleryImages.length / 2}, minmax(0, 1fr))`,
        }}
      >
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
                alt={image.caption || "Gallery Image"}
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
            alt="Large view" // TODO: Add alt text based on image data
            width={800}
            height={600}
            className={styles.modalImage}
            style={{ objectFit: "contain", cursor: "pointer" }}
            priority
          />
        </div>
      )}
    </div>
  );
};
