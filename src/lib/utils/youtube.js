/**
 * Extract YouTube video ID from a URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The video ID or null if not found
 */
export function extractVideoId(url) {
  if (!url) return null;

  // Handle different YouTube URL formats

  // Standard video URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/]+)/);
  if (watchMatch) return watchMatch[1];

  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^&?\/]+)/);
  if (embedMatch) return embedMatch[1];

  // Shortened URL: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^&?\/]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

/**
 * Extract YouTube channel ID from a URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The channel ID or null if not found
 */
export function extractChannelId(url) {
  if (!url) return null;

  // Handle different YouTube channel URL formats

  // Channel URL: https://www.youtube.com/channel/CHANNEL_ID
  const channelMatch = url.match(/youtube\.com\/channel\/([^&?\/]+)/);
  if (channelMatch) return channelMatch[1];

  // Custom channel URL: Need to fetch the page and extract the channel ID
  // This would require a server-side function as it needs to fetch HTML

  return null;
}

/**
 * Check if a URL is a valid YouTube URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is a valid YouTube URL
 */
export function isYouTubeUrl(url) {
  if (!url) return false;

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

/**
 * Get YouTube thumbnail URL from video ID
 * @param {string} videoId - The YouTube video ID
 * @returns {string} - The thumbnail URL
 */
export function getYouTubeThumbnailUrl(videoId) {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
