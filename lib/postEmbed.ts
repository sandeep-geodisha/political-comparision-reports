export type EmbedPlatform = "instagram" | "facebook" | "twitter";

export function detectEmbedPlatform(link: string): EmbedPlatform | null {
  if (/instagram\.com/i.test(link)) return "instagram";
  if (/facebook\.com/i.test(link)) return "facebook";
  if (/twitter\.com|x\.com/i.test(link)) return "twitter";
  return null;
}

/** Instagram supports a direct iframe embed URL for any public post/reel — no SDK needed. */
export function instagramEmbedUrl(link: string): string | null {
  const match = link.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
  if (!match) return null;
  return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
}
