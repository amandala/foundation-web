"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/sanity/client";
import Image from "next/image";

type FooterData = {
  contactEmail?: string;
  socialLinks?: SocialLink[];
};

import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { SocialLink } from "../types";
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

export default function Footer() {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      const result = await client.fetch(`*[_type == "homePage"][0]{
        contactEmail,
        socialLinks[]{
          type,
          url,
          icon
        }
      }`);
      setData(result);
    };

    fetchFooterData();
  }, []);

  if (!data) return null;

  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-16 py-8 px-4 text-sm text-gray-700">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        {/* Nav */}
        <div>
          <h4 className="font-semibold mb-1">Navigation</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:underline">
                Events
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:underline">
                Gallery
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Follow</h4>
            <ul className="space-y-2">
              {data.socialLinks.map((link, i) => (
                <li key={i} className="flex items-center gap-2">
                  {link.icon?.asset && (
                    <Image
                      src={urlFor(link.icon).width(20).height(20).url()}
                      alt={link.type}
                      width={20}
                      height={20}
                    />
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.type}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        {data.contactEmail && (
          <div>
            <h4 className="font-semibold mb-1">Contact</h4>
            <a
              href={`mailto:${data.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              {data.contactEmail}
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
