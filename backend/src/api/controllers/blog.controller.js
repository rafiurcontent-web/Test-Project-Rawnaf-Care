const blogService = require('../services/blog.service');

const getPublicBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    const { data, total, page: currentPage, limit: currentLimit, totalPages } = await blogService.getPublicBlogs({ page, limit, search });

    res.status(200).json({
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

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await blogService.getBlogBySlug(slug);

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSlugs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const data = await blogService.getAllSlugs({ page, limit });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const { data, total, page: currentPage, limit: currentLimit, totalPages } = await blogService.getAdminBlogs({ page, limit });

    res.status(200).json({
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

const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, featuredImage, isPublished, metaTitle, metaDescription } = req.body;
    
    const blogData = {
      title,
      content,
      excerpt,
      featuredImage,
      isPublished,
      metaTitle,
      metaDescription,
    };

    const blog = await blogService.createBlog(blogData, req.admin.id);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await blogService.updateBlog(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = await blogService.togglePublish(id);

    res.status(200).json({
      success: true,
      message: 'Publish status updated',
      isPublished,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
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
