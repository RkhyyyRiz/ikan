"use client";

import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosGuide(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => null);
      setDeferredPrompt(null);
      return;
    }
    setShowIosGuide((prev) => !prev);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleInstallClick}
        className={`nav-tap-btn inline-flex items-center gap-1.5 rounded-full bg-[#115548] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 ${className}`}
      >
        <span>Install App</span>
      </button>

      {showIosGuide && (
        <div className="mt-2 w-64 rounded-2xl border border-hairline-silver bg-gallery-white p-3 text-left text-xs text-ink shadow-lg">
          <p className="font-semibold text-[#115548]">Pasang di Layar Utama</p>
          <p className="mt-1 text-slate">
            Ketuk tombol <strong>Bagikan / Share</strong> pada browser, lalu pilih{" "}
            <strong>Tambah ke Layar Utama</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
