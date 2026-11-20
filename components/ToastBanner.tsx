"use client";

import React from "react";

interface ToastBannerProps {
  message: string | null;
  onClose?: () => void;
}

export default function ToastBanner({ message, onClose }: ToastBannerProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 px-4">
      <div className="nav-page-enter flex items-center gap-3 rounded-full border border-hairline-silver bg-ink px-4 py-2.5 text-xs font-medium text-gallery-white shadow-lg">
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="nav-tap-btn rounded-full px-1.5 py-0.5 text-[11px] opacity-80 hover:opacity-100"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}
