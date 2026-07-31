/**
 * Parses a YouTube URL and extracts the video ID and thumbnail URL.
 *
 * @param {string} url - The YouTube URL (supports youtube.com/watch?v= and youtu.be/)
 * @returns {Object} { videoId, thumbnailUrl }
 * @throws {Error} If the URL is invalid or videoId cannot be extracted
 */
const parseYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    const error = new Error('Invalid YouTube URL format');
    error.statusCode = 400;
    error.name = 'YouTubeParserError';
    throw error;
  }

  // Regex to match and extract the 11-character video ID
  const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (!match || !match[1]) {
    const error = new Error('Invalid YouTube URL format');
    error.statusCode = 400;
    error.name = 'YouTubeParserError';
    throw error;
  }

  const videoId = match[1];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    videoId,
    thumbnailUrl,
  };
};

module.exports = parseYouTubeUrl;
