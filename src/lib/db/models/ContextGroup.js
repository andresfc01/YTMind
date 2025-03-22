import mongoose from "mongoose";

const contextGroupItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["channel", "video", "document", "url"],
    required: true,
  },
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "items.type",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const contextGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  items: [contextGroupItemSchema],
  metadata: {
    tags: [String],
    icon: {
      type: String,
      default: "folder", // Default icon name
    },
    color: {
      type: String,
      default: "#6366f1", // Default color (indigo)
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
});

// Middleware to update the 'updatedAt' field on each save
contextGroupSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  console.log(`Saving context group "${this.name}" in database ${mongoose.connection.db?.databaseName || "unknown"}`);
  next();
});

// Define refs for different item types
const typeToModelMap = {
  channel: "Channel",
  video: "Video",
  document: "Document",
  url: "Url",
};

// Method to get all items with populated references
contextGroupSchema.methods.getItemsWithDetails = async function () {
  const group = await this.constructor.findById(this._id);

  const populatedItems = [];
  for (const item of group.items) {
    try {
      const Model = mongoose.model(typeToModelMap[item.type]);
      const itemDetails = await Model.findById(item.id);
      if (itemDetails) {
        populatedItems.push({
          ...item.toObject(),
          details: itemDetails.toObject(),
        });
      }
    } catch (error) {
      console.error(`Error populating item: ${error.message}`);
    }
  }

  return populatedItems;
};

// Check if the model already exists to avoid overwrite errors
const ContextGroup = mongoose.models.ContextGroup || mongoose.model("ContextGroup", contextGroupSchema);

export default ContextGroup;
