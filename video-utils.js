export function parseVideoUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!["https:", "http:"].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const id = url.searchParams.get("v")
      || url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/)?.[1];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id)
      ? { platform: "youtube", embed: `https://www.youtube-nocookie.com/embed/${id}`, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, sourceUrl: url.href }
      : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id)
      ? { platform: "youtube", embed: `https://www.youtube-nocookie.com/embed/${id}`, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, sourceUrl: url.href }
      : null;
  }
  if (host === "instagram.com") {
    const match = url.pathname.match(/^\/(reel|reels|p)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const route = match[1] === "p" ? "p" : "reel";
    return { platform: "instagram", embed: `https://www.instagram.com/${route}/${match[2]}/embed`, sourceUrl: url.href };
  }
  if (host === "tiktok.com") {
    const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
    return id ? { platform: "tiktok", embed: `https://www.tiktok.com/player/v1/${id}`, sourceUrl: url.href } : null;
  }
  return null;
}

const thumbnailRequests = new Map();

export function getVideoThumbnail(videoUrl) {
  const video = parseVideoUrl(videoUrl);
  if (!video) return Promise.resolve(null);
  if (video.thumbnail) return Promise.resolve(video.thumbnail);
  if (video.platform !== "tiktok") return Promise.resolve(null);

  if (!thumbnailRequests.has(video.sourceUrl)) {
    const request = fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(video.sourceUrl)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Thumbnail service returned HTTP ${response.status}`);
        const result = await response.json();
        if (result.code !== 0) throw new Error(result.msg || "Thumbnail service could not process this video");
        const thumbnail = result.data?.origin_cover || result.data?.cover || result.data?.ai_dynamic_cover;
        if (typeof thumbnail !== "string") return null;
        const imageUrl = new URL(thumbnail);
        const allowedHost = /(^|\.)tiktokcdn(?:-[a-z]+)?\.com$/i.test(imageUrl.hostname);
        return imageUrl.protocol === "https:" && allowedHost ? imageUrl.href : null;
      })
      .catch((error) => {
        console.warn("Could not retrieve TikTok video thumbnail:", error);
        return null;
      });
    thumbnailRequests.set(video.sourceUrl, request);
  }
  return thumbnailRequests.get(video.sourceUrl);
}
