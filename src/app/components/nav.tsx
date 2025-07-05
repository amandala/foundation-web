"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white p-8 flex justify-between items-center max-w-7xl mx-auto relative">
      <Link href="/">
        <h1 className="text-xl font-bold">Foundation Collective</h1>
      </Link>

      <nav>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-semibold">
          <li>
            <Link
              href="/gallery"
              className="hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <h2>Gallery</h2>
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className="hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <h2>Events</h2>
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <h2>Blog</h2>
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
          <ul
            className="flex flex-col absolute top-full right-0 bg-white w-40 md:hidden z-50 border-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <li>
              <Link
                href="/gallery"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <h2>Gallery</h2>
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <h2>Events</h2>
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="block px-4 py-2 hover:bg-blue-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <h2>Blog</h2>
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
