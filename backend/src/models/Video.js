const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      match: [
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        'Please enter a valid YouTube URL',
      ],
    },
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
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

videoSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
