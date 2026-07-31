const Video = require('../../models/Video');

const findPublishedVideos = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const data = await Video.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Video.countDocuments({ isPublished: true });
  const totalPages = Math.ceil(total / limit);

  return { data, total, page, limit, totalPages };
};

const findById = async (id) => {
  return await Video.findById(id);
};

const findAllVideos = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const data = await Video.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Video.countDocuments({});
  const totalPages = Math.ceil(total / limit);

  return { data, total, page, limit, totalPages };
};

const create = async (data) => {
  return await Video.create(data);
};

const updateById = async (id, data) => {
  return await Video.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteById = async (id) => {
  return await Video.findByIdAndDelete(id);
};

module.exports = {
  findPublishedVideos,
  findById,
  findAllVideos,
  create,
  updateById,
  deleteById,
};
