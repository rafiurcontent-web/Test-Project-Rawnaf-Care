const express = require('express');
const blogController = require('../controllers/blog.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public Routes (No Auth required)
router.get('/', blogController.getPublicBlogs);

// CRITICAL ROUTE ORDERING: /slugs MUST be defined before /:slug
// Otherwise Express will incorrectly parse "slugs" as a dynamic :slug parameter.
router.get('/slugs', blogController.getAllSlugs);

// Dynamic public route
router.get('/:slug', blogController.getBlogBySlug);

// Protected Admin Routes
router.post('/', protect, blogController.createBlog);
router.put('/:id', protect, blogController.updateBlog);
router.patch('/:id/toggle-publish', protect, blogController.togglePublish);
router.delete('/:id', protect, blogController.deleteBlog);

module.exports = router;
