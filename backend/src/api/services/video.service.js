const videoRepository = require('../repositories/video.repository');
const parseYouTubeUrl = require('../../utils/youtubeParser');

const getPublicVideos = async ({ page, limit }) => {
  return await videoRepository.findPublishedVideos({ page, limit });
};

const getVideoById = async (id) => {
  const video = await videoRepository.findById(id);
  if (!video) {
    const error = new Error('Video not found');
    error.statusCode = 404;
    throw error;
  }
  return video;
};

const getAdminVideos = async ({ page, limit }) => {
  return await videoRepository.findAllVideos({ page, limit });
};

const createVideo = async (data, adminId) => {
  // Parse youtubeUrl to extract videoId and thumbnailUrl
  const { videoId, thumbnailUrl } = parseYouTubeUrl(data.youtubeUrl);
  
  data.videoId = videoId;
  data.thumbnailUrl = thumbnailUrl;
  data.createdBy = adminId;
  
  return await videoRepository.create(data);
};

const updateVideo = async (id, data) => {
  // Re-parse if a new youtubeUrl is provided
  if (data.youtubeUrl) {
    const { videoId, thumbnailUrl } = parseYouTubeUrl(data.youtubeUrl);
    data.videoId = videoId;
    data.thumbnailUrl = thumbnailUrl;
  }
  
  const updatedVideo = await videoRepository.updateById(id, data);
  if (!updatedVideo) {
    const error = new Error('Video not found');
    error.statusCode = 404;
    throw error;
  }
  
  return updatedVideo;
};

const togglePublish = async (id) => {
  const video = await videoRepository.findById(id);
  if (!video) {
    const error = new Error('Video not found');
    error.statusCode = 404;
    throw error;
  }
  
  video.isPublished = !video.isPublished;
  await video.save();
  return { isPublished: video.isPublished };
};

const deleteVideo = async (id) => {
  const deletedVideo = await videoRepository.deleteById(id);
  if (!deletedVideo) {
    const error = new Error('Video not found');
    error.statusCode = 404;
    throw error;
  }
  return { success: true };
};

module.exports = {
  getPublicVideos,
  getVideoById,
  getAdminVideos,
  createVideo,
  updateVideo,
  togglePublish,
  deleteVideo,
};
