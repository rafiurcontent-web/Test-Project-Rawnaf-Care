const videoService = require('../services/video.service');

const getPublicVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total, page: currentPage, limit: currentLimit, totalPages } = await videoService.getPublicVideos({ page, limit });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const { data, total, page: currentPage, limit: currentLimit, totalPages } = await videoService.getAdminVideos({ page, limit });

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createVideo = async (req, res, next) => {
  try {
    const { title, youtubeUrl, isPublished } = req.body;
    
    const videoData = {
      title,
      youtubeUrl,
      isPublished,
    };

    const video = await videoService.createVideo(videoData, req.admin.id);

    return res.status(201).json({
      success: true,
      message: 'Video added successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await videoService.updateVideo(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = await videoService.togglePublish(id);

    return res.status(200).json({
      success: true,
      message: 'Video publish status updated',
      isPublished,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await videoService.deleteVideo(id);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
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
