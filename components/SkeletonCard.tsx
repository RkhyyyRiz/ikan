"use client";

import React from "react";

export default function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-hairline-silver bg-gallery-white p-5 shadow-subtle"
        >
          <div className="nav-skeleton h-36 w-full rounded-2xl" />
          <div className="nav-skeleton mt-4 h-4 w-2/3 rounded-lg" />
          <div className="nav-skeleton mt-2 h-3 w-1/2 rounded-lg" />
          <div className="nav-skeleton mt-4 h-9 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
