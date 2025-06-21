"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white p-4 flex justify-between items-center max-w-7xl mx-auto relative">
      <Link href="/">
        <div className="text-xl font-bold">Foundation Collective</div>
      </Link>

      <nav>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-semibold">
          <li>
            <Link href="/gallery" className="hover:text-blue-600">
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/events" className="hover:text-blue-600">
              Events
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
          </li>
        </ul>

        {/* Mobile Burger Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {/* Hamburger icon */}
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <ul className="flex flex-col absolute top-full right-0 mt-2 bg-white w-40 md:hidden z-50">
            <li>
              <Link
                href="/gallery"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
