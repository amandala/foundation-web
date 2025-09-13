"use client";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { Partner } from "../types";

// Initialize builder with your Sanity projectId and dataset
const builder = imageUrlBuilder({
  projectId: "4qydhzw9",
  dataset: "production",
});

const PartnerGrid = ({ partners }: { partners: Partner[] }) => {
  const urlFor = (source: { asset: { _ref: string } }) => builder.image(source);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6 items-center">
      {partners.map((partner: Partner) => (
        <a
          key={partner._id}
          href={partner.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center p-4 "
          title={partner.name}
        >
          {partner.image ? (
            <Image
              src={urlFor(partner.image)
                .width(400) // request higher width for quality
                .auto("format")
                .url()}
              alt={partner.name}
              width={200}
              height={100}
              style={{
                objectFit: "contain",
                width: "100%",
                height: "auto",
                maxHeight: "100px",
                backgroundColor: "#fff",
                padding: "8px",
                borderRadius: "8px",
                display: "block",
              }}
              placeholder="blur"
              blurDataURL={urlFor(partner.image)
                .width(20)
                .height(10)
                .blur(20)
                .url()}
              loading="lazy"
            />
          ) : (
            <span className="text-gray-700">{partner.name}</span>
          )}
        </a>
      ))}
    </div>
  );
};

export default PartnerGrid;
