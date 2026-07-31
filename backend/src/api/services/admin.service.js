const Blog = require('../../models/Blog');
const Video = require('../../models/Video');

/**
 * Retrieves aggregate dashboard statistics for the admin panel.
 * 
 * @returns {Promise<Object>} Aggregated counts for blogs and videos.
 */
const getDashboardStats = async () => {
  const [blogStatsResult, videoStatsResult] = await Promise.all([
    Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] },
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ['$isPublished', false] }, 1, 0] },
          },
        },
      },
    ]),
    Video.aggregate([
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          publishedVideos: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] },
          },
          draftVideos: {
            $sum: { $cond: [{ $eq: ['$isPublished', false] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  // Handle cases where the collection might be empty (aggregation returns empty array)
  const blogStats = blogStatsResult[0] || {
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
  };

  const videoStats = videoStatsResult[0] || {
    totalVideos: 0,
    publishedVideos: 0,
    draftVideos: 0,
  };

  // Remove the grouping _id before returning
  if (blogStats._id !== undefined) delete blogStats._id;
  if (videoStats._id !== undefined) delete videoStats._id;

  return {
    blogs: blogStats,
    videos: videoStats,
  };
};

module.exports = {
  getDashboardStats,
};
