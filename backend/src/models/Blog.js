const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      default: '',
    },
    featuredImage: {
      url: {
        type: String,
        default: '',
      },
      public_id: {
        type: String,
        default: '',
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    metaTitle: {
      type: String,
      maxlength: [160, 'Meta title cannot exceed 160 characters'],
      default: '',
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre('save', function () {
  if (!this.metaTitle && this.title) {
    this.metaTitle = this.title.slice(0, 160);
  }
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.slice(0, 160);
  }
});

blogSchema.index({ isPublished: 1, createdAt: -1 });
blogSchema.index({ title: 'text', excerpt: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
