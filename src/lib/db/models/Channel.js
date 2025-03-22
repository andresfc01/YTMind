import mongoose from "mongoose";

/**
 * Schema para análisis de videos populares (versión de referencia)
 * Ahora solo guardamos el ID del video y métricas básicas para análisis
 */
const popularVideoAnalysisSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  engagement: {
    type: Number,
    default: 0,
  },
  keyFactors: {
    type: [String],
    default: [],
  },
});

/**
 * Schema para análisis de miniaturas populares
 */
const popularThumbnailsAnalysisSchema = new mongoose.Schema({
  commonElements: [String],
  colorSchemes: [String],
  textUsage: String,
  imageComposition: String,
});

/**
 * Schema para análisis de títulos populares
 */
const popularTitlesAnalysisSchema = new mongoose.Schema({
  patterns: [String],
  lengthStats: {
    min: Number,
    max: Number,
    avg: Number,
  },
  keywordsUsage: [
    {
      keyword: String,
      frequency: Number,
    },
  ],
});

/**
 * Schema principal para canales de YouTube
 */
const channelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  statistics: {
    videoCount: Number,
    subscriberCount: Number,
    viewCount: Number,
  },
  analysis: {
    targetAudience: String,
    mainTopics: [String],
    publicationFrequency: Number,
    visualStyle: String,
    communicationStyle: String,
    popularVideosAnalysis: [popularVideoAnalysisSchema],
    popularThumbnailsAnalysis: popularThumbnailsAnalysisSchema,
    popularTitlesAnalysis: popularTitlesAnalysisSchema,
    // Array de IDs de videos populares
    popularVideos: [String],
  },
  metadata: {
    thumbnailUrl: String,
    country: String,
    startDate: Date,
    customUrl: String,
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
channelSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(`Guardando canal "${this.name}" (${this.channelId}) en la base de datos`);
  next();
});

// Verificamos si el modelo ya existe para evitar errores de sobredefinición
const Channel = mongoose.models.Channel || mongoose.model("Channel", channelSchema);

export default Channel;
