"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/sanity/client";
import { SocialLink } from "../types";

type FooterData = {
  contactEmail?: string;
  socialLinks?: SocialLink[];
};

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
    <footer className="bg-white border-t border-white mt-16  p-8 text-sm text-gray-700">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-center md:text-left">
        {/* Navigation Section */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-semibold mb-2 text-2xl">Navigation</h4>
          <ul className="space-y-2">
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

        {/* Social Links Section */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-2 text-2xl">Follow</h4>
            <ul className="space-y-2">
              {data.socialLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.type}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Section */}
        {data.contactEmail && (
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-2 text-2xl">Contact</h4>
            <a href={`mailto:${data.contactEmail}`} className="hover:underline">
              {data.contactEmail}
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
