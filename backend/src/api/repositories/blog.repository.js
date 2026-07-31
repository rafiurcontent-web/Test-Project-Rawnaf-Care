const Blog = require('../../models/Blog');

const findPublishedBlogs = async ({ page = 1, limit = 10, search = '' }) => {
  const query = { isPublished: true };
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  
  // Use the compound index { isPublished: 1, createdAt: -1 } for sorting
  const data = await Blog.find(query)
    .sort({ isPublished: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Blog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return { data, total, page, limit, totalPages };
};

const findBySlug = async (slug) => {
  return await Blog.findOne({ slug, isPublished: true });
};

const findAllSlugs = async ({ page = 1, limit = 100 }) => {
  const skip = (page - 1) * limit;
  return await Blog.find({ isPublished: true })
    .select('slug updatedAt -_id')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

const findAllBlogs = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const data = await Blog.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Blog.countDocuments({});
  const totalPages = Math.ceil(total / limit);

  return { data, total, page, limit, totalPages };
};

const findById = async (id) => {
  return await Blog.findById(id);
};

const create = async (data) => {
  return await Blog.create(data);
};

const updateById = async (id, data) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteById = async (id) => {
  return await Blog.findByIdAndDelete(id);
};

const countBySlugPattern = async (slugPattern) => {
  return await Blog.countDocuments({ slug: { $regex: slugPattern, $options: 'i' } });
};

module.exports = {
  findPublishedBlogs,
  findBySlug,
  findAllSlugs,
  findAllBlogs,
  findById,
  create,
  updateById,
  deleteById,
  countBySlugPattern,
};
