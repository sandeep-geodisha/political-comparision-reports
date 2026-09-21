"use client";

import { useEffect, useRef, useState } from "react";
import type { TopPost } from "@/lib/types";
import { detectEmbedPlatform, instagramEmbedUrl } from "@/lib/postEmbed";
import { formatCompactNumber } from "@/lib/data";

declare global {
  interface Window {
    FB?: {
      XFBML: { parse: (node?: HTMLElement) => void };
      init: (opts: Record<string, unknown>) => void;
    };
    twttr?: {
      widgets: { load: (node?: HTMLElement) => void };
    };
    fbAsyncInit?: () => void;
  }
}

function loadScriptOnce(id: string, src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

const EMBED_TIMEOUT_MS = 6000;

export function PostEmbedModal({ post, onClose }: { post: TopPost; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{post.page}</p>
            <p className="text-xs text-muted">
              {post.date} · {formatCompactNumber(post.engagement)} engagements
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <EmbedContent key={post.link} post={post} />
        </div>
      </div>
    </div>
  );
}

function EmbedContent({ post }: { post: TopPost }) {
  const platform = detectEmbedPlatform(post.link);
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!platform);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!platform) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setFailed(true);
    }, EMBED_TIMEOUT_MS);

    async function setup() {
      if (platform === "instagram") {
        // The iframe's own onLoad handles success; nothing else to do here.
        return;
      }

      if (platform === "facebook") {
        await loadScriptOnce(
          "fb-sdk",
          "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"
        );
        if (cancelled) return;
        if (window.FB && containerRef.current) {
          window.FB.XFBML.parse(containerRef.current);
          setLoaded(true);
        } else {
          setFailed(true);
        }
        return;
      }

      if (platform === "twitter") {
        await loadScriptOnce("twitter-wjs", "https://platform.twitter.com/widgets.js");
        if (cancelled) return;
        if (window.twttr && containerRef.current) {
          window.twttr.widgets.load(containerRef.current);
          setLoaded(true);
        } else {
          setFailed(true);
        }
      }
    }

    setup();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [platform]);

  if (failed || !platform) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-muted">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">This post couldn&rsquo;t be embedded</p>
        <p className="text-xs text-muted">
          It may have been deleted, made private, or the platform is blocking embeds right now.
        </p>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white"
        >
          Open on {platform ? platform[0].toUpperCase() + platform.slice(1) : "the original site"}
          <span aria-hidden>→</span>
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      )}
      <div ref={containerRef} className={"flex justify-center p-2" + (loaded ? "" : " hidden")}>
        {platform === "instagram" && (
          <InstagramEmbed link={post.link} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
        )}
        {platform === "facebook" && <FacebookEmbed link={post.link} />}
        {platform === "twitter" && <TwitterEmbed link={post.link} />}
      </div>
    </div>
  );
}

function InstagramEmbed({
  link,
  onLoad,
  onError,
}: {
  link: string;
  onLoad: () => void;
  onError: () => void;
}) {
  const src = instagramEmbedUrl(link);
  if (!src) {
    onError();
    return null;
  }
  return (
    <iframe
      src={src}
      title="Instagram post"
      width="360"
      height="480"
      style={{ border: "none", maxWidth: "100%" }}
      onLoad={onLoad}
      allowFullScreen
    />
  );
}

function FacebookEmbed({ link }: { link: string }) {
  return (
    <div
      className="fb-post"
      data-href={link}
      data-width="500"
      data-show-text="true"
    />
  );
}

function TwitterEmbed({ link }: { link: string }) {
  return (
    <blockquote className="twitter-tweet">
      <a href={link}>{link}</a>
    </blockquote>
  );
}
