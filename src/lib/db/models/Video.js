import mongoose from "mongoose";

/**
 * Schema principal para videos de YouTube
 */
const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  channelTitle: String,
  publishedAt: Date,
  statistics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    thumbnailUrl: String,
    duration: String,
    tags: [String],
    category: String,
  },
  isShort: {
    type: Boolean,
    default: false,
  },
  transcription: {
    type: String,
    default: null,
  },
  analyzedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar la fecha 'updatedAt' en cada actualización
videoSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Índices para optimizar consultas comunes
videoSchema.index({ channelId: 1, viewCount: -1 }); // Para buscar videos populares de un canal
videoSchema.index({ publishedAt: -1 }); // Para ordenar por fecha de publicación

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;
