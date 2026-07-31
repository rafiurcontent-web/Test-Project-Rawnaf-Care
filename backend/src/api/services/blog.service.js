const blogRepository = require('../repositories/blog.repository');
const Blog = require('../../models/Blog');
const generateUniqueSlug = require('../../utils/slugify');
const cloudinary = require('../../config/cloudinary');
const logger = require('../../utils/logger');

const getPublicBlogs = async ({ page, limit, search }) => {
  return await blogRepository.findPublishedBlogs({ page, limit, search });
};

const getBlogBySlug = async (slug) => {
  const blog = await blogRepository.findBySlug(slug);
  if (!blog) {
    const error = new Error('Blog post not found');
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

const getAllSlugs = async ({ page, limit }) => {
  return await blogRepository.findAllSlugs({ page, limit });
};

const getAdminBlogs = async ({ page, limit }) => {
  return await blogRepository.findAllBlogs({ page, limit });
};

const createBlog = async (data, adminId) => {
  if (!data.title) {
    const error = new Error('Blog title is required');
    error.statusCode = 400;
    throw error;
  }
  
  const slug = await generateUniqueSlug(data.title, Blog);
  data.slug = slug;
  data.createdBy = adminId;
  
  return await blogRepository.create(data);
};

const updateBlog = async (id, data) => {
  const existingBlog = await blogRepository.findById(id);
  if (!existingBlog) {
    const error = new Error('Blog post not found');
    error.statusCode = 404;
    throw error;
  }

  // Regenerate slug if the title is being updated and has changed
  if (data.title && data.title !== existingBlog.title) {
    data.slug = await generateUniqueSlug(data.title, Blog);
  }

  return await blogRepository.updateById(id, data);
};

const togglePublish = async (id) => {
  const blog = await blogRepository.findById(id);
  if (!blog) {
    const error = new Error('Blog post not found');
    error.statusCode = 404;
    throw error;
  }

  blog.isPublished = !blog.isPublished;
  await blog.save(); // Utilizing Mongoose instance save

  return { isPublished: blog.isPublished };
};

const deleteBlog = async (id) => {
  const blog = await blogRepository.findById(id);
  if (!blog) {
    const error = new Error('Blog post not found');
    error.statusCode = 404;
    throw error;
  }

  await blogRepository.deleteById(id);

  // Best-effort async Cloudinary cleanup
  if (blog.featuredImage && blog.featuredImage.public_id) {
    cloudinary.uploader.destroy(blog.featuredImage.public_id).catch((err) => {
      logger.error(`Cloudinary cleanup failed: ${err.message}`);
    });
  }

  return { success: true };
};

module.exports = {
  getPublicBlogs,
  getBlogBySlug,
  getAllSlugs,
  getAdminBlogs,
  createBlog,
  updateBlog,
  togglePublish,
  deleteBlog,
};
