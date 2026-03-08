"use client";

import { useState, useRef, useEffect } from "react";
import { Tag } from "../types";
import styles from "./styles.module.scss";

export const ArtistSearch = ({
  tags,
  activeSlugs,
  onSelect,
  disabled,
}: {
  tags: Tag[];
  activeSlugs: string[];
  onSelect: (slug: string) => void;
  disabled: boolean;
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query.toLowerCase()) &&
      !activeSlugs.includes(tag.slug.current)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={styles.artistSearch}>
      <input
        type="text"
        placeholder={disabled ? "Max 2 filters selected" : "Search artists..."}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        className={styles.searchInput}
      />
      {isOpen && filtered.length > 0 && (
        <ul className={styles.searchDropdown}>
          {filtered.map((tag) => (
            <li key={tag._id}>
              <button
                onClick={() => handleSelect(tag.slug.current)}
                className={styles.searchOption}
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
