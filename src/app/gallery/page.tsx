"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const GalleryPage = dynamic(() => import("./GalleryPage"), { ssr: false });

export default function GalleryWrapper() {
  return (
    <Suspense fallback={<p>Loading gallery...</p>}>
      <GalleryPage />
    </Suspense>
  );
}
