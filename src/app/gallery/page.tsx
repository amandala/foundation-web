"use client";

import React, { useState } from "react";
import Image from "next/image";
import { client } from "../../sanity/client";

type GalleryImage = {
  _id: string;
  image: {
    asset: {
      url: string;
    };
  };
  tag: string;
  url: string;
};

const fetchGalleryImages = async (): Promise<GalleryImage[]> => {
  const query = `*[_type == "galleryImage"]{
    _id,
    "id": _id,
    "url": image.asset->url,
    "tag": tags[0]
  }`;

  const results = await client.fetch(query);

  return results.map((item: { _id: string; url: string; tag: string }) => ({
    _id: item._id,
    url: item.url,
    tag: item.tag,
    image: {
      asset: {
        url: item.url,
      },
    },
  }));
};

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagesByTag, setImagesByTag] = useState<
    Record<string, GalleryImage[]>
  >({});

  React.useEffect(() => {
    fetchGalleryImages().then((galleryImages) => {
      const grouped = galleryImages.reduce(
        (acc, image) => {
          if (!acc[image.tag]) acc[image.tag] = [];
          acc[image.tag].push(image);
          return acc;
        },
        {} as Record<string, GalleryImage[]>
      );
      setImagesByTag(grouped);
    });
  }, []);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-2xl font-bold mb-4">Gallery</h1>
      {Object.entries(imagesByTag).map(([tag, images]) => (
        <div key={tag}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                onClick={() => setSelectedImage(image.url)}
                className="cursor-pointer"
              >
                <Image
                  src={image.url}
                  alt={tag}
                  width={350}
                  height={350}
                  className="rounded shadow hover:opacity-80 transition"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt="Large view"
            width={800}
            height={600}
            className="rounded shadow-lg max-h-[90vh] object-contain"
          />
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
