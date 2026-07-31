const slugify = require('slugify');

/**
 * Generates a unique slug for a blog post.
 * 
 * @param {string} title - The blog title
 * @param {Object} BlogModel - The Mongoose Blog model
 * @returns {Promise<string>} - A guaranteed unique slug
 */
const generateUniqueSlug = async (title, BlogModel) => {
  // Generate base slug
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    replacement: '-',
  });

  // Fallback for Bengali/Unicode strings that produce empty slugs
  if (!baseSlug) {
    baseSlug = `post-${Date.now()}`;
  }

  let slug = baseSlug;
  let isUnique = false;
  let count = 1;

  // Collision resolution
  while (!isUnique) {
    const existingBlog = await BlogModel.findOne({ slug });
    if (!existingBlog) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${count}`;
      count++;
    }
  }

  return slug;
};

module.exports = generateUniqueSlug;
