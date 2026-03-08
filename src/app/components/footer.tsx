import Link from "next/link";
import { client } from "@/sanity/client";
import { SocialLink } from "../types";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { type IconType } from "react-icons";

const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  twitter: FaXTwitter,
  youtube: FaYoutube,
};

type FooterData = {
  contactEmail?: string;
  socialLinks?: SocialLink[];
};

export default async function Footer({ hasBlog = true }: { hasBlog?: boolean }) {
  const data = await client.fetch<FooterData>(
    `*[_type == "homePage"][0]{
      contactEmail,
      socialLinks[]{
        type,
        url
      }
    }`,
    {},
    { next: { revalidate: 30 } }
  );

  if (!data) return null;

  return (
    <footer className="bg-white border-t border-white mt-8 px-4 py-8 sm:p-8 text-sm text-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-center md:text-left">
        {/* Navigation Section */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-semibold mb-2 text-2xl">Navigation</h4>
          <ul className="space-y-2">
            {hasBlog && (
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
            )}
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
              {data.socialLinks.map((link, i) => {
                const Icon = socialIcons[link.type];
                return (
                  <li key={link.url || `${link.type}-${i}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline inline-flex items-center gap-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                    </a>
                  </li>
                );
              })}
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
