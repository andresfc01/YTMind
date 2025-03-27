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
 * Extract YouTube channel ID or username from a URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The channel ID, username (with @ prefix), or null if not found
 */
export function extractChannelId(url) {
  if (!url) return null;

  // Handle different YouTube channel URL formats

  // Channel URL: https://www.youtube.com/channel/CHANNEL_ID
  const channelMatch = url.match(/youtube\.com\/channel\/([^&?\/]+)/);
  if (channelMatch) return channelMatch[1];

  // Username URL: https://www.youtube.com/@username
  const usernameMatch = url.match(/youtube\.com\/@([^&?\/]+)/);
  if (usernameMatch) return "@" + usernameMatch[1];

  // Alternative username URL: https://www.youtube.com/c/username
  const cMatch = url.match(/youtube\.com\/c\/([^&?\/]+)/);
  if (cMatch) return "c/" + cMatch[1];

  // Alternative username URL: https://www.youtube.com/user/username
  const userMatch = url.match(/youtube\.com\/user\/([^&?\/]+)/);
  if (userMatch) return "user/" + userMatch[1];

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

/**
 * Check if a channel identifier is a custom username (starts with @, c/, or user/)
 * @param {string} channelIdentifier - The channel ID or username
 * @returns {boolean} - Whether it's a custom username
 */
export function isChannelUsername(channelIdentifier) {
  if (!channelIdentifier) return false;
  return (
    channelIdentifier.startsWith("@") || channelIdentifier.startsWith("c/") || channelIdentifier.startsWith("user/")
  );
}
